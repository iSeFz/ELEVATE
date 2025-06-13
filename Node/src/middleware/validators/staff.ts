import { Request, Response, NextFunction } from 'express';
import { Staff } from '../../types/models/staff.js';
import { createSchemaBuilder, validateObjectStrict } from './builder.js';

const expectedSignupStaffData = createSchemaBuilder<Staff>()
    .field('email', { type: 'string', required: true, value: 'name@elevate.com' })
    .field('phoneNumber', { type: 'string', required: true, minLength: 11, maxLength: 11, value: '01234567890' })
    .field('firstName', { type: 'string', required: true, minLength: 3, maxLength: 30, value: 'John' })
    .field('lastName', { type: 'string', required: true, minLength: 3, maxLength: 30, value: 'Doe' })
    .field('username', { type: 'string', required: true, minLength: 3, maxLength: 30, value: 'johndoe' })
    .build();

export const validateSignupStaff = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedSignupStaffData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}