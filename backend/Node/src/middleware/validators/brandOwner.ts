import { Request, Response, NextFunction } from 'express';
import { BrandOwner } from '../../types/models/brandOwner.js';
import { Brand } from '../../types/models/brand.js';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { addressSchema, emailPattern, passwordPattern, phonePattern, usernamePattern, websitePattern, websiteSchema } from './common.js';

const expectedBrandData = createSchemaBuilder<Brand>()
    .field('brandName', { type: 'string', required: true, minLength: 1, maxLength: 30, value: 'Elevate' })
    .field('email', {
        type: 'string', required: true,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('industry', { type: 'string', required: true, minLength: 1, maxLength: 30, value: 'Retail' })
    .field('storyDescription', {
        type: 'string', required: true,
        minLength: 0, maxLength: 500, value: 'Elevate is a brand that...'
    })
    .field('imageURL', {
        type: 'string', required: false,
        patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
    .field('phoneNumbers', {
        type: 'array',
        required: false,
        items: {
            type: 'string',
            value: '01234567890', patternRgx: phonePattern.regex, patternHint: phonePattern.Hint
        }
    })
    .field('addresses', { type: 'array', required: false, items: { type: 'object', fields: addressSchema } })
    .field('websites', { type: 'array', required: false, items: { type: 'object', fields: websiteSchema } })
    .build();
const expecteSignupData = createSchemaBuilder<{ brand: Brand } & BrandOwner>()
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
    .field('brand', { type: 'object', required: true, fields: expectedBrandData })
    .field('username', {
        type: 'string', required: false, minLength: 3, maxLength: 15,
        value: 'elevateUser', patternRgx: usernamePattern.regex, patternHint: usernamePattern.Hint
    })
    .field('imageURL', {
        type: 'string', required: false,
        patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
    .build();
export const validateSignupBrandOwner = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as { brand: Brand } & BrandOwner;

    const result = validateObjectStrict(data, expecteSignupData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expecteSignupData)(req, res, next);
}

const expectedUpdateBrandOwnerData = createSchemaBuilder<BrandOwner>()
    .field('username', { type: 'string', required: false, minLength: 3, maxLength: 15, value: 'elevateUser' })
    .field('imageURL', { type: 'string', required: false })
    .field('firstName', { type: 'string', required: false, minLength: 2, maxLength: 15 })
    .field('lastName', { type: 'string', required: false, minLength: 2, maxLength: 15 })
    .build();
export const validateUpdateBrandOwner = (req: Request, res: Response, next: NextFunction) => {
    const brandOwner = req.body as BrandOwner;

    const result = validateObjectStrict(brandOwner, expectedUpdateBrandOwnerData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedUpdateBrandOwnerData)(req, res, next);
}
