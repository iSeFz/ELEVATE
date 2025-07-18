import { Request, Response, NextFunction } from 'express';
import { BrandManager } from '../../types/models/brandManager.js';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { emailPattern, passwordPattern, usernamePattern, websitePattern } from './common.js';

const expectedSignupBrandManagerData = createSchemaBuilder<BrandManager>()
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('password', {
        type: 'string', required: true, minLength: 6, maxLength: 30,
        value: 'password123', patternRgx: passwordPattern.regex, patternHint: passwordPattern.Hint
    })
    .field('firstName', { type: 'string', required: true, minLength: 2, maxLength: 15, value: 'John' })
    .field('lastName', { type: 'string', required: true, minLength: 2, maxLength: 15, value: 'Doe' })
    .field('username', {
        type: 'string', required: false, minLength: 3, maxLength: 15,
        value: 'elevateUser', patternRgx: usernamePattern.regex, patternHint: usernamePattern.Hint
    })
    .field('imageURL', {
        type: 'string', required: false,
        patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
    .field('brandOwnerId', { type: 'string', required: true, value: 'brandOwnerId123' })
    .build();

export const validateSignupBrandManager = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedSignupBrandManagerData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedSignupBrandManagerData)(req, res, next);
}

const expectedUpdateBrandManagerData = createSchemaBuilder<BrandManager>()
    .field('username', { type: 'string', required: false, minLength: 3, maxLength: 15, value: 'elevateUser' })
    .field('imageURL', { type: 'string', required: false })
    .field('firstName', { type: 'string', required: false, minLength: 2, maxLength: 15 })
    .field('lastName', { type: 'string', required: false, minLength: 2, maxLength: 15 })
    .build();
export const validateUpdateBrandManager = (req: Request, res: Response, next: NextFunction) => {
    const brandManager = req.body as BrandManager;

    const result = validateObjectStrict(brandManager, expectedUpdateBrandManagerData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedUpdateBrandManagerData)(req, res, next);
}
