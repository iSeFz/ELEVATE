import { Request, Response, NextFunction } from 'express';
import { Staff } from '../../types/models/staff.js';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { emailPattern, phonePattern, usernamePattern } from './common.js';

const expectedSignupStaffData = createSchemaBuilder<Staff>()
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('phoneNumber', {
        type: 'string', required: true,
        value: '01234567890', patternRgx: phonePattern.regex, patternHint: phonePattern.Hint
    })
    .field('firstName', { type: 'string', required: true, minLength: 3, maxLength: 30, value: 'John' })
    .field('lastName', { type: 'string', required: true, minLength: 3, maxLength: 30, value: 'Doe' })
    .field('username', {
        type: 'string', required: true,
        value: 'elevateUser', patternRgx: usernamePattern.regex, patternHint: usernamePattern.Hint
    })
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

    extractSchemaFieldsMiddleware(expectedSignupStaffData)(req, res, next);
}