import { admin, verifyCredentialsURL } from '../config/firebase.js';
import axios from 'axios';
import { Customer } from '../types/models/customer.js';
import { Staff } from '../types/models/staff.js';
import { BrandOwner } from '../types/models/brandOwner.js';
import { checkMissingCustomerRequestData, generateEmptyCustomerData } from './utils/customer.js';
import { checkMissingStaffData } from './utils/staff.js';
import { checkMissingBrandOwnerData } from './utils/brandOwner.js';
import { Brand } from '../types/models/brand.js';
import { checkMissingBrandData } from './utils/brand.js';
import { Timestamp } from 'firebase-admin/firestore';

const auth = admin.auth();
const firestore = admin.firestore();

// Authentication error types
export enum AuthErrorType {
    MISSING_CREDENTIALS = 'missing_credentials',
    INVALID_EMAIL = 'invalid_email',
    INVALID_PASSWORD = 'invalid_password',
    EMAIL_ALREADY_EXISTS = 'email_already_exists',
    USER_NOT_FOUND = 'user_not_found',
    TOO_MANY_ATTEMPTS = 'too_many_attempts',
    INVALID_SIGNUP_DATA = 'invalid_signup_data',
    WEAK_PASSWORD = 'weak_password',
    SERVER_ERROR = 'server_error',
    USER_DISABLED = 'user_disabled',
    UNKNOWN_ERROR = 'unknown_error'
}

// Custom error class for authentication errors
export class AuthError extends Error {
    type: AuthErrorType;
    code: string;
    statusCode: number;

    constructor(message: string, type: AuthErrorType, code = '', statusCode = 400) {
        super(message);
        this.type = type;
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AuthError';
    }
}

// Helper function to check auth credentials
const checkMissingCredentials = (credentials: { email?: string, password?: string }) => {
    if (!credentials.email) {
        throw new AuthError(
            'Email is required',
            AuthErrorType.MISSING_CREDENTIALS,
            'auth/missing-email',
            400
        );
    }
    if (!credentials.password) {
        throw new AuthError(
            'Password is required',
            AuthErrorType.MISSING_CREDENTIALS,
            'auth/missing-password',
            400
        );
    }
};

// Convert Firebase auth errors to our custom AuthError format
const handleFirebaseAuthError = (error: any): AuthError => {
    const errorCode = error.code || '';
    let message = error.message || 'An unknown authentication error occurred';
    let type = AuthErrorType.UNKNOWN_ERROR;
    let statusCode = 400;

    switch (errorCode) {
        case 'auth/email-already-exists':
            message = 'The email address is already in use by another account.';
            type = AuthErrorType.EMAIL_ALREADY_EXISTS;
            break;
        case 'auth/invalid-email':
            message = 'The email address is not valid.';
            type = AuthErrorType.INVALID_EMAIL;
            break;
        case 'auth/invalid-password':
            message = 'The password must be at least 6 characters.';
            type = AuthErrorType.INVALID_PASSWORD;
            break;
        case 'auth/weak-password':
            message = 'The password is too weak. Please use a stronger password.';
            type = AuthErrorType.WEAK_PASSWORD;
            break;
        case 'auth/user-not-found':
            message = 'No user found with this email address.';
            type = AuthErrorType.USER_NOT_FOUND;
            statusCode = 404;
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password. Please try again.';
            type = AuthErrorType.INVALID_PASSWORD;
            statusCode = 401;
            break;
        case 'auth/too-many-requests':
            message = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
            type = AuthErrorType.TOO_MANY_ATTEMPTS;
            statusCode = 429;
            break;
        case 'auth/user-disabled':
            message = 'This account has been disabled. Please contact support.';
            type = AuthErrorType.USER_DISABLED;
            statusCode = 403;
            break;
        case 'auth/internal-error':
            message = 'Authentication server error. Please try again later.';
            type = AuthErrorType.SERVER_ERROR;
            statusCode = 500;
            break;
        default:
            console.error('Unhandled Firebase auth error:', error);
            message = 'Authentication failed. Please try again.';
            type = AuthErrorType.UNKNOWN_ERROR;
            statusCode = error.statusCode || 400;
    }

    return new AuthError(message, type, errorCode, statusCode);
};

// Generic signup function that handles different user types
export const genericSignup = async (userData: any, userType: 'customer' | 'staff' | 'brandOwner', otherClaims = {}) => {
    // Validate data based on user type
    let missedData = null;

    if (userType === 'customer') {
        missedData = checkMissingCustomerRequestData(userData);
    } else if (userType === 'staff') {
        missedData = checkMissingStaffData(userData);
    } else if (userType === 'brandOwner') {
        missedData = checkMissingBrandOwnerData(userData);
    }

    if (missedData) {
        throw new AuthError(
            missedData,
            AuthErrorType.INVALID_SIGNUP_DATA,
            'auth/invalid-signup-data',
            400
        );
    }

    try {
        const userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            emailVerified: false,
        });

        auth.setCustomUserClaims(userRecord.uid, { role: userType, ...otherClaims });

        // Remove password from data stored in Firestore
        const { password, id, ...cleanedData } = userData;

        // Save user data to Firestore
        await firestore.collection(userType).doc(userRecord.uid).set(cleanedData);

        return userRecord;
    } catch (error: any) {
        throw handleFirebaseAuthError(error);
    }
};

// Validations for brand and brand owner data
export const validateBrandAndOwnerData = (brandOwner: BrandOwner, brand: Brand) => {
    const missedBrandData = checkMissingBrandData(brand);
    if (missedBrandData) {
        throw new Error(missedBrandData);
    }

    const missedBrandOwnerData = checkMissingBrandOwnerData(brandOwner);
    if (missedBrandOwnerData) {
        throw new AuthError(
            missedBrandOwnerData,
            AuthErrorType.INVALID_SIGNUP_DATA,
            'auth/invalid-signup-data',
            400
        );
    }

    return { brandOwner, brand };
}

// Type-specific signup functions that use the generic function
export const signup = async (customer: Customer) => {
    const customerData: Customer = {
        ...generateEmptyCustomerData(),
        username: customer.username,
        email: customer.email,
        password: customer.password,
    };
    return genericSignup(customerData, 'customer');
};

export const staffSignup = async (staff: Staff) => {
    return genericSignup(staff, 'staff');
};

export const brandOwnerSignup = async (brandOwner: BrandOwner) => {
    const brandOwnerData: BrandOwner = {
        brandId: brandOwner.brandId ?? "", // Will be updated after brand creation
        email: brandOwner.email,
        password: brandOwner.password,
        firstName: brandOwner.firstName,
        lastName: brandOwner.lastName,
        username: brandOwner.username,
        imageURL: brandOwner.imageURL ?? '',
        createdAt: brandOwner.createdAt ?? Timestamp.now(),
        updatedAt: brandOwner.updatedAt ?? Timestamp.now(),
    }
    return genericSignup(brandOwnerData, 'brandOwner');
};

export const login = async (email: string, password: string) => {
    try {
        // Check for missing credentials
        checkMissingCredentials({ email, password });

        const response = await axios.post(verifyCredentialsURL, {
            email,
            password,
            returnSecureToken: true
        });

        const { localId: uid, idToken } = response.data;

        // Get additional user data from Firestore
        const userDoc = await firestore.collection('customer').doc(uid).get();
        let userData = userDoc.exists ? userDoc.data() : null;
        let role = 'customer';
        let collectionName = 'customer';

        // If no user found in customer collection, check other collections
        if (!userData) {
            // Check staff collection
            const staffDoc = await firestore.collection('staff').doc(uid).get();
            if (staffDoc.exists) {
                userData = staffDoc.data();
                role = userData?.role ?? 'staff';
                collectionName = 'staff';
            } else {
                // Check brand owner collection
                const brandOwnerDoc = await firestore.collection('brandOwner').doc(uid).get();
                if (brandOwnerDoc.exists) {
                    userData = brandOwnerDoc.data();
                    role = 'brandOwner';
                    collectionName = 'brandOwner';
                }
            }
        }

        // If still no user data found, create a minimal record
        if (!userData) {
            console.warn(`User ${uid} authenticated but no Firestore record found`);
            userData = { email };
        }

        return {
            user: {
                id: uid,
                email,
                role,
                collectionName,
                ...userData
            },
            token: idToken
        };
    } catch (error: any) {
        // Handle axios errors specifically
        if (error.response) {
            const firebaseError = error.response.data.error || {};

            // Map Firebase REST API error messages
            switch (firebaseError.message) {
                case 'EMAIL_NOT_FOUND':
                    throw new AuthError(
                        'No user found with this email address.',
                        AuthErrorType.USER_NOT_FOUND,
                        'auth/user-not-found',
                        404
                    );
                case 'INVALID_PASSWORD':
                    throw new AuthError(
                        'Incorrect password. Please try again.',
                        AuthErrorType.INVALID_PASSWORD,
                        'auth/wrong-password',
                        401
                    );
                case 'USER_DISABLED':
                    throw new AuthError(
                        'This account has been disabled. Please contact support.',
                        AuthErrorType.USER_DISABLED,
                        'auth/user-disabled',
                        403
                    );
                case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                    throw new AuthError(
                        'Too many unsuccessful login attempts. Please try again later.',
                        AuthErrorType.TOO_MANY_ATTEMPTS,
                        'auth/too-many-requests',
                        429
                    );
                default:
                    throw new AuthError(
                        'Authentication failed. Please check your email and password.',
                        AuthErrorType.UNKNOWN_ERROR,
                        firebaseError.message || 'auth/unknown-error',
                        401
                    );
            }
        }

        // If it's already our custom AuthError, just rethrow it
        if (error instanceof AuthError) {
            throw error;
        }

        // For any other errors
        throw new AuthError(
            'Authentication failed. Please try again later.',
            AuthErrorType.SERVER_ERROR,
            'auth/server-error',
            500
        );
    }
};

export const staffLogin = async (email: string, password: string) => {
    // Reusing the generic login function but verifying it's a staff account
    const userData = await login(email, password);

    if (userData.user.role !== 'staff') {
        throw new AuthError(
            'This account is not a staff account',
            AuthErrorType.USER_NOT_FOUND,
            'auth/user-not-staff',
            403
        );
    }

    return userData;
};

export const brandOwnerLogin = async (email: string, password: string) => {
    // Reusing the generic login function but verifying it's a brand owner account
    const userData = await login(email, password);

    if (userData.user.role !== 'brandOwner') {
        throw new AuthError(
            'This account is not a brand owner account',
            AuthErrorType.USER_NOT_FOUND,
            'auth/user-not-brand-owner',
            403
        );
    }

    return userData;
};

export const deleteCredentialsUsingEmailAndPassword = async (email: string, password: string) => {
    try {
        // Check for missing credentials
        checkMissingCredentials({ email, password });

        const response = await axios.post(verifyCredentialsURL, {
            email,
            password,
            returnSecureToken: true
        });

        const { localId: uid } = response.data;

        await auth.deleteUser(uid);

        return "User deleted successfully";
    } catch (error: any) {
        // Handle axios errors specifically
        if (error.response) {
            const firebaseError = error.response.data.error || {};

            switch (firebaseError.message) {
                case 'EMAIL_NOT_FOUND':
                    throw new AuthError(
                        'No user found with this email address.',
                        AuthErrorType.USER_NOT_FOUND,
                        'auth/user-not-found',
                        404
                    );
                case 'INVALID_PASSWORD':
                    throw new AuthError(
                        'Incorrect password. Please try again.',
                        AuthErrorType.INVALID_PASSWORD,
                        'auth/wrong-password',
                        401
                    );
                default:
                    throw new AuthError(
                        'Authentication failed. Please check your email and password.',
                        AuthErrorType.UNKNOWN_ERROR,
                        firebaseError.message || 'auth/unknown-error',
                        401
                    );
            }
        }

        // If it's already our custom AuthError, just rethrow it
        if (error instanceof AuthError) {
            throw error;
        }

        throw new AuthError(
            'Failed to delete user. Please try again later.',
            AuthErrorType.SERVER_ERROR,
            'auth/server-error',
            500
        );
    }
};

export const deleteCredentialsUsingUID = async (uid: string) => {
    try {
        if (!uid) {
            throw new AuthError(
                'User ID is required',
                AuthErrorType.MISSING_CREDENTIALS,
                'auth/missing-uid',
                400
            );
        }

        await auth.deleteUser(uid);
        return "User deleted successfully";
    } catch (error: any) {
        if (error instanceof AuthError) {
            throw error;
        }

        if (error.code === 'auth/user-not-found') {
            throw new AuthError(
                'No user found with this ID.',
                AuthErrorType.USER_NOT_FOUND,
                'auth/user-not-found',
                404
            );
        }

        throw new AuthError(
            'Failed to delete user. Please try again later.',
            AuthErrorType.SERVER_ERROR,
            error.code || 'auth/server-error',
            500
        );
    }
};