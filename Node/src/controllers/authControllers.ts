import { Request, Response } from 'express';
import * as authService from '../services/auth.js';
import { AuthError, AuthErrorType } from '../services/auth.js';
import { Customer } from '../types/models/customer.js';
import { Staff } from '../types/models/staff.js';
import { BrandOwner } from '../types/models/brandOwner.js';

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
            username: req.body.username,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            imageURL: req.body.imageURL ?? '',
            brand: req.body.brand,
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