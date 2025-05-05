import { Request, Response } from 'express';
import * as customerService from '../services/customer.js';
import { Customer } from '../types/models/customer.js';
import { signup } from './authControllers.js';

export const getAllCustomers = async (req: Request, res: Response) => {
    // This route is already protected by authorize middleware in the router
    try {
        const customers = await customerService.getAllCustomers();
        return res.status(200).json({ status: 'success', data: customers });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.params.id;
        
        // Authorization check is now handled by middleware
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

export const addCustomer = async (req: Request, res: Response) => signup(req, res);

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.params.id;
        const userRole = req.user?.role;
        const userID = req.user?.id;
        
        // Add proper authorization check
        // Only admins/staff or the customer themselves can update the customer profile
        if (userRole !== 'admin' && userRole !== 'staff' && userID !== customerID) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'You are not authorized to update this customer profile' 
            });
        }
        
        const newCustomerData = sanitizeCustomerData(req.body, userRole);
        
        // Check if customer exists first
        const existingCustomer = await customerService.getCustomer(customerID);
        if (!existingCustomer) {
            return res.status(404).json({ status: 'error', message: 'Customer not found' });
        }
        
        // Prevent users from elevating their own privileges
        if (userRole !== 'admin' && newCustomerData.role && newCustomerData.role !== 'customer') {
            return res.status(403).json({ 
                status: 'error', 
                message: 'You cannot change your role' 
            });
        }
        
        await customerService.updateCustomer(customerID, newCustomerData);
        return res.status(200).json({ status: 'success', message: 'Customer updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.params.id;
        
        // Authorization check is now handled by middleware
        
        // Check if customer exists first
        const existingCustomer = await customerService.getCustomer(customerID);
        if (!existingCustomer) {
            return res.status(404).json({ status: 'error', message: 'Customer not found' });
        }
        
        await customerService.deleteCustomer(customerID);
        return res.status(200).json({ status: 'success', message: 'Customer deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

// Helper function to sanitize customer data
const sanitizeCustomerData = (newCustomerData: any, userRole?: string): Partial<Customer> => {
    // Updated list of allowed customer fields based on our new Customer type
    let customerFields = [
        'email', 'firstName', 'lastName', 'username', 'phoneNumber', 
        'imageURL', 'address'
    ];
    
    // Allow admin to update additional fields
    if (userRole === 'admin' || userRole === 'staff') {
        customerFields = [
            ...customerFields,
            'loyaltyPoints', 'role'
        ];
    }
    
    const sanitizedData: Partial<Customer> = {};
    
    for (const key in newCustomerData) {
        if (customerFields.includes(key)) {
            sanitizedData[key as keyof Customer] = newCustomerData[key];
        }
    }
    
    return sanitizedData;
};
