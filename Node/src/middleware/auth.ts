import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase.js';
import { FirebaseError } from 'firebase-admin';
import * as authorizationService from '../services/authorization.js';

// Test key for bypassing auth in development environments
const TEST_AUTH_KEY = 'ELEVATE_TEST_KEY';
const TEST_AUTH_HEADER = 'X-Test-Auth';
const ENABLE_TEST_AUTH = process.env.NODE_ENV !== 'production';

// Error codes for authentication/authorization
export const AuthErrorCodes = {
    NO_TOKEN: 'auth/no-token',
    INVALID_TOKEN: 'auth/invalid-token',
    EXPIRED_TOKEN: 'auth/id-token-expired',
    USER_DISABLED: 'auth/user-disabled',
    USER_NOT_FOUND: 'auth/user-not-found',
    INSUFFICIENT_PERMISSIONS: 'auth/insufficient-permissions',
    UNAUTHORIZED_ROLE: 'auth/unauthorized-role',
    INVALID_CLAIMS: 'auth/invalid-claims',
};

/**
 * Middleware to verify Firebase authentication token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Test backdoor for development - disabled in production
        if (ENABLE_TEST_AUTH || req.headers[TEST_AUTH_HEADER.toLowerCase()] === TEST_AUTH_KEY) {
            // For testing, we'll set a mock user
            req.user = {
                id: 'test-user-id',
                email: 'test@example.com',
                role: 'admin'
            };
            return next();
        }

        // Extract token from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                code: AuthErrorCodes.NO_TOKEN,
                message: 'Authentication required. Please provide a valid token.'
            });
        }

        // Get and verify the token
        const token = authHeader.split('Bearer ')[1];
        let decodedToken;

        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
            const firebaseError = error as FirebaseError;
            if (firebaseError.code === 'auth/id-token-expired') {
                return res.status(401).json({
                    status: 'error',
                    code: AuthErrorCodes.EXPIRED_TOKEN,
                    message: 'Your session has expired. Please login again.'
                });
            } else if (firebaseError.code === 'auth/id-token-revoked') {
                return res.status(401).json({
                    status: 'error',
                    code: AuthErrorCodes.INVALID_TOKEN,
                    message: 'Your session has been revoked. Please login again.'
                });
            } else if (firebaseError.code === 'auth/user-disabled') {
                return res.status(403).json({
                    status: 'error',
                    code: AuthErrorCodes.USER_DISABLED,
                    message: 'Your account has been disabled. Please contact support.'
                });
            } else if (firebaseError.code === 'auth/user-not-found') {
                return res.status(404).json({
                    status: 'error',
                    code: AuthErrorCodes.USER_NOT_FOUND,
                    message: 'User not found. Please register or login with a valid account.'
                });
            } else {
                return res.status(401).json({
                    status: 'error',
                    code: AuthErrorCodes.INVALID_TOKEN,
                    message: 'Invalid authentication token. Please login again.'
                });
            }
        }

        if (!decodedToken) {
            return res.status(401).json({
                status: 'error',
                code: AuthErrorCodes.INVALID_TOKEN,
                message: 'Invalid or expired token'
            });
        }

        // Check for required claims/fields
        if (!decodedToken.email) {
            return res.status(400).json({
                status: 'error',
                code: AuthErrorCodes.INVALID_CLAIMS,
                message: 'User token is missing required information'
            });
        }

        // Attach user info to request
        req.user = {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role ?? 'customer'
        };

        next();
    } catch (error: any) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            status: 'error',
            code: 'auth/unknown-error',
            message: 'Authentication failed. Please try again later.'
        });
    }
};

/**
 * Middleware to restrict access based on user roles
 * @param roles - Array of allowed roles
 */
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                code: AuthErrorCodes.NO_TOKEN,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                code: AuthErrorCodes.UNAUTHORIZED_ROLE,
                message: `Access denied. Required role: ${roles.join(' or ')}.`
            });
        }

        next();
    };
};

/**
 * Type definition for resource authorization check functions
 */
type ResourceAuthorizationCheck = (
  resourceId: string, 
  userId: string, 
  userRole: string
) => Promise<boolean>;

/**
 * Centralized middleware factory for resource authorization
 * @param checkFunction - The specific authorization check function for the resource type
 * @param resourceNameForErrors - Resource name used in error messages
 */
const createResourceAuthorizationMiddleware = (
    checkFunction: ResourceAuthorizationCheck,
    resourceNameForErrors: string
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                code: AuthErrorCodes.NO_TOKEN,
                message: 'Authentication required'
            });
        }

        const resourceId = req.params.id;
        if (!resourceId) {
            return res.status(400).json({
                status: 'error',
                message: `${resourceNameForErrors} ID is required`
            });
        }

        try {
            const isAuthorized = await checkFunction(
                resourceId,
                req.user.id,
                req.user.role
            );

            if (!isAuthorized) {
                return res.status(403).json({
                    status: 'error',
                    code: AuthErrorCodes.INSUFFICIENT_PERMISSIONS,
                    message: `You do not have permission to access this ${resourceNameForErrors.toLowerCase()}`
                });
            }

            next();
        } catch (error) {
            console.error(`${resourceNameForErrors} authorization error:`, error);
            return res.status(500).json({
                status: 'error',
                message: `Error verifying ${resourceNameForErrors.toLowerCase()} ownership`
            });
        }
    };
};

// Create specialized middleware functions using the factory
export const authorizeOrderAccess = createResourceAuthorizationMiddleware(
    authorizationService.checkOrderAuthorization,
    'Order'
);

export const authorizeReviewAccess = createResourceAuthorizationMiddleware(
    authorizationService.checkReviewAuthorization,
    'Review'
);

export const authorizeBrandAccess = createResourceAuthorizationMiddleware(
    authorizationService.checkBrandAuthorization,
    'Brand'
);

export const authorizeProductAccess = createResourceAuthorizationMiddleware(
    authorizationService.checkProductAuthorization, 
    'Product'
);

export const authorizeInventoryAccess = createResourceAuthorizationMiddleware(
    authorizationService.checkInventoryAuthorization,
    'Inventory'
);
