import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { addressSchema, emailPattern, phonePattern, websitePattern } from './common.js';

const signupSchema = createSchemaBuilder()
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('uid', { type: 'string', required: true })
    .field('firstName', { type: 'string', required: false })
    .field('lastName', { type: 'string', required: false })
    .field('username', { type: 'string', required: false, value: 'elevateUser' })
    .field('phoneNumber', {
        type: 'string', required: false, minLength: 11, maxLength: 11,
        value: '01234567890', patternRgx: phonePattern.regex, patternHint: phonePattern.Hint
    })
    .field('addresses', { type: 'array', required: false, items: { type: 'object', fields: addressSchema } })
    .field('imageURL', {
        type: 'string', required: false,
        patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
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

    extractSchemaFieldsMiddleware(signupSchema)(req, res, next);
}

const loginSchema = createSchemaBuilder()
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('password', {
        type: 'string', required: true
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

    extractSchemaFieldsMiddleware(loginSchema)(req, res, next);
};
