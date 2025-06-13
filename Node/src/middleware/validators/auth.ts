import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, validateObjectStrict } from './builder.js';

const signupSchema = createSchemaBuilder()
    .field('email', { type: 'string', required: true, minLength: 5, maxLength: 50, value: 'name@elevate.com' })
    .field('uid', { type: 'string', required: true })
    .build();
export const validateThirdPartySignup = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    const result = validateObjectStrict(data, signupSchema);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}

const loginSchema = createSchemaBuilder()
    .field('email', { type: 'string', required: true, value: 'name@elevate.com' })
    .field('password', { type: 'string', required: true, minLength: 6, maxLength: 30, value: 'password123' })
    .build();
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    const result = validateObjectStrict(data, loginSchema);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
};
