import { Request, Response } from 'express';
import * as authService from '../services/auth.js';
import { AuthError, AuthErrorType } from '../services/auth.js';
import { Customer } from '../types/models/customer.js';
import { Staff } from '../types/models/staff.js';
import { BrandOwner } from '../types/models/brandOwner.js';
import * as customerService from '../services/customer.js';
import * as staffService from '../services/staff.js';
import * as brandOwnerService from '../services/brandOwner.js';

export const signup = async (req: Request, res: Response) => {
    try {
        const customerData: Customer = {
            id: '',
            username: req.body.username,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            imageURL: req.body.imageURL ?? '',
            address: req.body.address ?? {},
            loyaltyPoints: 0,
            role: 'customer',
            cart: {
                items: [],
                subtotal: 0
            },
            wishlist: [],
            orders: []
        };

        const userRecord = await authService.signup(customerData);

        // Return success response without password
        const { password, ...safeCustomerData } = customerData;
        return res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                ...safeCustomerData,
                id: userRecord.uid,
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
        
        console.error('Signup error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during registration'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userData = await authService.login(email, password);
        
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
        
        console.error('Login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred during login'
        });
    }
};

export const staffSignup = async (req: Request, res: Response) => {
    try {
        const staffData = {
            id: '',
            username: req.body.username,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            imageURL: req.body.imageURL ?? '',
            role: 'staff',
        };

        const userRecord = await authService.staffSignup(staffData as Staff);

        // Return success response without password
        const { password, ...safeStaffData } = staffData;
        safeStaffData.id = userRecord.uid; // Add the UID to the response data
        return res.status(201).json({
            status: 'success',
            message: 'Staff registration successful',
            data: safeStaffData
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
        const brandOwnerData = {
            id: '',
            username: req.body.username ?? '',
            email: req.body.email,
            firstName: req.body.firstName ?? '',
            lastName: req.body.lastName ?? '',
            imageURL: req.body.imageURL ?? '',
            brandId: req.body.brandId ?? '',
            password: req.body.password,
            role: 'brandOwner',
        };

        const userRecord = await authService.brandOwnerSignup(brandOwnerData as BrandOwner);

        // Return success response without password
        const { password, ...safeBrandOwnerData } = brandOwnerData;
        safeBrandOwnerData.id = userRecord.uid; // Add the UID to the response data
        return res.status(201).json({
            status: 'success',
            message: 'Brand owner registration successful',
            data: safeBrandOwnerData
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
            message: 'An unexpected error occurred during brand owner registration'
        });
    }
};

export const staffLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userData = await authService.staffLogin(email, password);
        
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
                    email: req.user.email,
                    role: 'admin'
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
            message: error.message || 'An error occurred while retrieving user profile'
        });
    }
};