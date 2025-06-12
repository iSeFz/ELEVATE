import { Request, Response } from 'express';
import * as authService from '../services/auth.js';
import { AuthError } from '../services/auth.js';
import { BrandOwner } from '../types/models/brandOwner.js';
import * as customerService from '../services/customer.js';
import * as staffService from '../services/staff.js';
import * as brandService from '../services/brand.js';
import * as brandOwnerService from '../services/brandOwner.js';
import { Brand } from '../types/models/brand.js';

export const customerSignup = async (req: Request, res: Response) => {
    try {
        const userRecord = await authService.customerSignup(req.body);

        return res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                id: userRecord.id,
                email: userRecord.email,
            }
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            console.error('AuthError during signup:', error);
            return res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                type: error.type,
                message: error.message
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during registration'
        });
    }
};

export const thirdPartySignup = async (req: Request, res: Response) => {
    try {
        const { uid, email } = req.body;
        const userRecord = await authService.thirdPartySignup({
            id: uid,
            email: email,
        });

        return res.status(201).json({
            status: 'success',
            message: 'Third-party registration successful',
            data: {
                id: userRecord.id,
                email: userRecord.email,
            }
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            console.error('AuthError during third-party signup:', error);
            return res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                type: error.type,
                message: error.message
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during third-party registration'
        });
    }
}

export const customerLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userData = await authService.customerLogin(email, password);

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: userData
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                type: error.type,
                message: error.message
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during login'
        });
    }
};

export const staffSignup = async (req: Request, res: Response) => {
    try {
        const userRecord = await authService.staffSignup(req.body);

        return res.status(201).json({
            status: 'success',
            message: 'Staff registration successful',
            data: {
                id: userRecord.id,
                email: userRecord.email,
            }
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                type: error.type,
                message: error.message
            });
        }

        console.error('Staff signup error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during staff registration'
        });
    }
};

export const brandOwnerSignup = async (req: Request, res: Response) => {
    try {
        // Extract both brand owner and brand data from the request
        let { brand: brandData, ...brandOwnerData }: { brand: Brand } & BrandOwner = req.body;

        // 1. Create brand owner account
        brandOwnerData.brandName = brandData.brandName;
        const userRecord = await authService.brandOwnerSignup(brandOwnerData);
        const brandOwnerId = userRecord.id;

        // 2. Create brand with reference to the brand owner
        brandData.brandOwnerId = brandOwnerId; // Set the brand ID to the brand owner ID

        // Import brand service
        const newBrand = await brandService.addBrand(brandData);

        // 3. Update brand owner with brand reference
        await brandOwnerService.updateBrandOwner(brandOwnerId, {
            brandId: newBrand.id
        });

        // Return success response without password
        const { password, ...safeBrandOwnerData } = brandOwnerData;
        return res.status(201).json({
            status: 'success',
            message: 'Brand owner and brand registration successful',
            data: {
                brandOwner: {
                    ...safeBrandOwnerData,
                    id: brandOwnerId,
                    brandId: newBrand.id
                },
                brand: newBrand
            }
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                type: error.type,
                message: error.message
            });
        }

        console.error('Brand owner signup error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message ?? 'An unexpected error occurred during brand owner registration'
        });
    }
};

export const brandManagerLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userData = await authService.brandManagerLogin(email, password);

        return res.status(200).json({
            status: 'success',
            message: 'Staff login successful',
            data: userData
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                type: error.type,
                message: error.message
            });
        }

        console.error('Staff login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during staff login'
        });
    }
};

export const brandOwnerLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userData = await authService.brandOwnerLogin(email, password);

        return res.status(200).json({
            status: 'success',
            message: 'Brand owner login successful',
            data: userData
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                type: error.type,
                message: error.message
            });
        }

        console.error('Brand owner login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during brand owner login'
        });
    }
};

/**
 * Get the current authenticated user's profile
 */
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const userId = req.user.id;
        const userRole = req.user.role;
        let userData = null;

        // Get user data based on role
        switch (userRole) {
            case 'customer':
                userData = await customerService.getCustomer(userId);
                break;
            case 'staff':
                userData = await staffService.getStaff(userId);
                break;
            case 'brandOwner':
                userData = await brandOwnerService.getBrandOwnerById(userId);
                break;
            case 'admin':
                // For admin users, we might have a separate admin service
                // or we could return basic information from the token
                userData = {
                    id: userId,
                    name: "Shawky Ebrahim Ahmed",
                    email: req.user.email,
                    role: userRole
                };
                break;
            default:
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user role'
                });
        }

        if (!userData) {
            return res.status(404).json({
                status: 'error',
                message: 'User profile not found'
            });
        }

        // Remove sensitive fields if they exist
        if ('password' in userData) {
            delete userData.password;
        }

        return res.status(200).json({
            status: 'success',
            data: userData
        });
    } catch (error: any) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message ?? 'An error occurred while retrieving user profile'
        });
    }
};

export const sendPasswordResetEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required'
            });
        }
        await authService.sendPasswordResetEmail(email);
        return res.status(200).json({
            status: 'success',
            message: 'If the email exists, a password reset link has been sent.'
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message ?? 'Failed to send password reset email'
        });
    }
};

export const confirmPasswordReset = async (req: Request, res: Response) => {
    try {
        const { oobCode, newPassword } = req.body;
        if (!oobCode || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'OTP and new password are required'
            });
        }
        await authService.confirmPasswordReset(oobCode, newPassword);
        return res.status(200).json({
            status: 'success',
            message: 'Password has been reset successfully'
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message ?? 'Failed to reset password'
        });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token is required'
            });
        }

        const tokenData = await authService.refreshAccessToken(refreshToken);

        return res.status(200).json({
            status: 'success',
            data: tokenData
        });
    } catch (error: any) {
        return res.status(error.statusCode ?? 400).json({
            status: 'error',
            message: error.message
        });
    }
};
