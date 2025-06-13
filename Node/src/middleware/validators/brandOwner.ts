import { Request, Response, NextFunction } from 'express';
import { BrandOwner } from '../../types/models/brandOwner.js';
import { Brand } from '../../types/models/brand.js';
import { createSchemaBuilder, validateObjectStrict } from './builder.js';
import { addressSchema, websiteSchema } from './common.js';

const expectedBrandData = createSchemaBuilder<Brand>()
    .field('brandName', { type: 'string', required: true, minLength: 1, maxLength: 30, value: 'Elevate' })
    .field('email', { type: 'string', required: true, value: 'name@elevate.com' })
    .field('industry', { type: 'string', required: true, minLength: 1, maxLength: 30, value: 'Retail' })
    .field('storyDescription', { type: 'string', required: true, minLength: 0, maxLength: 500, value: 'Elevate is a brand that...' })
    .field('imageURL', { type: 'string', required: false })
    .field('phoneNumbers', {
        type: 'array',
        required: false,
        items: { type: 'string', minLength: 11, maxLength: 11, value: '01234567890' }
    })
    .field('addresses', { type: 'array', required: false, items: { type: 'object', fields: addressSchema } })
    .field('websites', { type: 'array', required: false, items: { type: 'object', fields: websiteSchema } })
    .build();
const expecteSignupData = createSchemaBuilder<{ brand: Brand } & BrandOwner>()
    .field('email', { type: 'string', required: true, value: 'name@elevate.com' })
    .field('password', { type: 'string', required: true, minLength: 6, maxLength: 30, value: 'password123' })
    .field('firstName', { type: 'string', required: true, minLength: 2, maxLength: 15, value: 'John' })
    .field('lastName', { type: 'string', required: true, minLength: 2, maxLength: 15, value: 'Doe' })
    .field('brand', { type: 'object', required: true, fields: expectedBrandData })
    .field('username', { type: 'string', required: false, minLength: 3, maxLength: 15, value: 'elevateUser' })
    .field('imageURL', { type: 'string', required: false })
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

    next();
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

    next();
}
