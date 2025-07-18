import { Request, Response, NextFunction } from 'express';
import { Customer } from '../../types/models/customer.js';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, SchemaBuilder, validateObjectStrict } from './builder.js';
import { addressSchema, emailPattern, passwordPattern, phonePattern, usernamePattern, websitePattern } from './common.js';

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
    .field('username', {
        type: 'string', required: false, minLength: 3, maxLength: 15,
        value: 'elevateUser', patternRgx: usernamePattern.regex, patternHint: usernamePattern.Hint
    })
    .field('email', {
        type: 'string', required: false,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('phoneNumber', {
        type: 'string', required: false, minLength: 11, maxLength: 11,
        value: '01234567890', patternRgx: phonePattern.regex, patternHint: phonePattern.Hint
    })
    .field('addresses', { type: 'array', required: false, items: { type: 'object', fields: addressSchema } })
    .field('imageURL', {
        type: 'string', required: false,
        patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
    .field('loyaltyPoints', { type: 'number', required: false, value: 0 })

const signupCustomerSchema = new SchemaBuilder(customerSchemaBuilder)
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('password', {
        type: 'string', required: true, minLength: 6, maxLength: 30,
        value: 'password123', patternRgx: passwordPattern.regex, patternHint: passwordPattern.Hint
    })
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

    extractSchemaFieldsMiddleware(signupCustomerSchema)(req, res, next);
}

const updateCustomerSchema = customerSchemaBuilder.build();
export const validateUpdateCustomer = (req: Request, res: Response, next: NextFunction) => {
    const customer = req.body as Customer;
    const result = validateObjectStrict(customer, updateCustomerSchema);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(updateCustomerSchema)(req, res, next);
}
