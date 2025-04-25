import { Request, Response } from 'express';
import * as customerService from '../services/customer.js';
import { Customer } from '../types/models/customer.js';

export const getAllCustomers = async (req: Request, res: Response) => {
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
        
        const customers = await customerService.getCustomerWithEmail(customerEmail);
        
        if (!customers || customers.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Customer not found' });
        }
        
        return res.status(200).json({ status: 'success', data: customers[0] });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const addCustomer = async (req: Request, res: Response) => {
    try {
        const customer: Customer = req.body;
        const newCustomer = await customerService.addCustomer(customer);
        return res.status(201).json({ 
            status: 'success', 
            message: 'Customer added successfully', 
            data: newCustomer 
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.params.id;
        const newCustomerData = sanitizeCustomerData(req.body);
        
        // Check if customer exists first
        const existingCustomer = await customerService.getCustomer(customerID);
        if (!existingCustomer) {
            return res.status(404).json({ status: 'error', message: 'Customer not found' });
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
const sanitizeCustomerData = (newCustomerData: any): Partial<Customer> => {
    // Updated list of allowed customer fields based on our new Customer type
    const customerFields = [
        'email', 'firstName', 'lastName', 'username', 'phoneNumber', 
        'imageURL', 'address', 'loyaltyPoints', 'role'
    ];
    
    const sanitizedData: Partial<Customer> = {};
    
    for (const key in newCustomerData) {
        if (customerFields.includes(key)) {
            sanitizedData[key as keyof Customer] = newCustomerData[key];
        }
    }
    
    return sanitizedData;
};
