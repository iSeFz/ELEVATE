import { Request, Response, NextFunction } from 'express';
import { Customer, customerDataValidators } from '../../types/models/customer.js';
import { validateObjectStructure } from './common.js';

export const validateGetAllCustomers = (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    if (isNaN(page) || page < 1) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid page number. Page must be a positive integer.'
        });
    }

    next();
}

export const validateSignupCustomer = (req: Request, res: Response, next: NextFunction) => {
    const customer: Customer = req.body;

    if (customer.email == null || typeof customer.email !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Email must be a string'
        });
    }

    if (customer.password == null || typeof customer.password !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Password must be a string'
        });
    }

    if (customer.password.length < 6) {
        return res.status(400).json({
            status: 'error',
            message: 'Password must be at least 6 characters'
        });
    }

    next();
}

const expectedUpdateCustomerData: Partial<Customer> = {
    firstName: "String",
    lastName: "String",
    email: "String",
    phoneNumber: "String",
    addresses: [{
        postalCode: 123456,
        building: 123,
        city: "String",
        street: "String",
        latitude: 30.0313294,
        longitude: 31.2081442,
    }],
    imageURL: "String",
    username: "String",
}
/**
 * Required Parameters:
 * - id: String - ID of the brand owner to update
 * 
 * Data to update:
 * - firstName: String
 * - lastName: String
 * - email: String
 * - phoneNumber: String
 * - address: Address object
 *   - postalCode: Number
 *   - building: Number
 *   - city: String
 *   - street: String
 *  - imageURL: String
 *  - username: String
 */
export const validateUpdateCustomer = (req: Request, res: Response, next: NextFunction) => {
    const customer = req.body as Customer;
    if (!validateObjectStructure(customer, expectedUpdateCustomerData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedUpdateCustomerData
        });
    }

    const isCustomerValid = customerDataValidators(customer);
    if (!isCustomerValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid customer data types.',
            expectedFormat: expectedUpdateCustomerData
        });
    }

    next();
}
