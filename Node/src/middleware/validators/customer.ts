import { Request, Response, NextFunction } from 'express';
import { Customer } from '../../types/models/customer.js';
import { createSchemaBuilder, validateObjectStrict } from './builder.js';
import { addressSchema } from './common.js';

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

const customerSchemaBuilder = createSchemaBuilder<Customer>()
    .field('firstName', { type: 'string', required: false, minLength: 2, maxLength: 15 })
    .field('lastName', { type: 'string', required: false, minLength: 2, maxLength: 15 })
    .field('username', { type: 'string', required: false, minLength: 3, maxLength: 15, value: 'elevateUser' })
    .field('email', { type: 'string', required: false, value: 'name@elevate.com' })
    .field('phoneNumber', { type: 'string', required: false, minLength: 11, maxLength: 11, value: '01234567890' })
    .field('addresses', { type: 'array', required: false, items: { type: 'object', fields: addressSchema } })
    .field('imageURL', { type: 'string', required: false });

const signupCustomerSchema = customerSchemaBuilder
    .field('email', { type: 'string', required: true })
    .field('password', { type: 'string', required: true, minLength: 6, maxLength: 30 })
    .build();
export const validateSignupCustomer = (req: Request, res: Response, next: NextFunction) => {
    const customer: Customer = req.body;

    const result = validateObjectStrict(customer, signupCustomerSchema);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}

const customerSchema = customerSchemaBuilder.build();
export const validateUpdateCustomer = (req: Request, res: Response, next: NextFunction) => {
    const customer = req.body as Customer;
    const result = validateObjectStrict(customer, customerSchema);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}
