import { Request, Response } from 'express';
import * as customerService from '../services/customer.js';
import { customerSignup } from './authControllers.js';

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string);

        const result = await customerService.getAllCustomers(page);
        return res.status(200).json({
            status: 'success',
            data: result.customers,
            pagination: result.pagination
        });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.user?.id!;
        const customer = await customerService.getCustomer(customerID);

        if (!customer) {
            return res.status(404).json({ status: 'error', message: 'Customer not found' });
        }

        return res.status(200).json({ status: 'success', data: customer });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getCustomerByEmail = async (req: Request, res: Response) => {
    // Not used in the current implementation, but kept for future use
    try {
        const customerEmail = req.query.email as string;

        if (!customerEmail) {
            return res.status(400).json({ status: 'error', message: 'Email parameter is required' });
        }

        // Authorization check is now handled by middleware
        const customers = await customerService.getCustomerWithEmail(customerEmail);

        if (!customers || customers.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Customer not found' });
        }

        return res.status(200).json({ status: 'success', data: customers[0] });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const addCustomer = async (req: Request, res: Response) => customerSignup(req, res);

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.user?.id!;

        await customerService.updateCustomer(customerID, req.body);
        return res.status(200).json({ status: 'success', message: 'Customer updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.user?.id!;

        await customerService.deleteCustomer(customerID);
        return res.status(200).json({ status: 'success', message: 'Customer deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getCustomerOrders = async (req: Request, res: Response) => {
    try {
        const customerID = req.user?.id!;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;

        if (isNaN(page) || page < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid page number. Page must be a positive integer.'
            });
        }

        const result = await customerService.getCustomerOrders(customerID, page);

        return res.status(200).json({
            status: 'success',
            data: result.orders,
            pagination: result.pagination
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
