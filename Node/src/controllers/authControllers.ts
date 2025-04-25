import { Request, Response } from 'express';
import * as authService from '../services/auth.js';
import { Customer } from '../types/models/customer.js';
import { Staff } from '../types/models/staff.js';

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
            address: req.body.address ?? null,
            loyaltyPoints: 0,
            role: 'customer',
            cart: undefined,
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
                id: userRecord.uid,
                ...safeCustomerData
            }
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        const userData = await authService.login(email, password);
        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: userData
        });
    } catch (error: any) {
        return res.status(401).json({
            status: 'error',
            message: error.message
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
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};