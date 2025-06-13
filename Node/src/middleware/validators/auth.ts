import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, validateObjectStrict } from './builder.js';
import { emailPattern, passwordPattern } from './common.js';

const signupSchema = createSchemaBuilder()
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
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
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('password', {
        type: 'string', required: true, minLength: 6, maxLength: 30,
        value: 'password123', patternRgx: passwordPattern.regex, patternHint: passwordPattern.Hint
    })
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
