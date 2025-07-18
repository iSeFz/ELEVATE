import { Request, Response, NextFunction } from 'express';
import { Brand } from '../../types/models/brand.js';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../config/subscriptionPlans.js';
import { addressSchema, emailPattern, websiteSchema } from './common.js';

const expectedUpdateBrandData = createSchemaBuilder<Brand>()
    .field('addresses', { type: 'array', required: false, items: { type: 'object', fields: addressSchema } })
    .field('brandName', { type: 'string', required: false, minLength: 1, maxLength: 30 })
    .field('email', {
        type: 'string', required: false,
        value: 'name@elevate.com', patternRgx: emailPattern.regex, patternHint: emailPattern.Hint
    })
    .field('imageURL', { type: 'string', required: false })
    .field('industry', { type: 'string', required: false, minLength: 1, maxLength: 30, value: 'Retail' })
    .field('phoneNumbers', {
        type: 'array',
        required: false,
        items: { type: 'string', minLength: 11, maxLength: 11, value: '01234567890' }
    })
    .field('rating', { type: 'number', required: false })
    .field('storyDescription', { type: 'string', required: false, minLength: 0, maxLength: 500 })
    .field('websites', { type: 'array', required: false, items: { type: 'object', fields: websiteSchema } })
    .build();
export const validateUpdateBrand = (req: Request, res: Response, next: NextFunction) => {
    const brand = req.body as Brand;

    const result = validateObjectStrict(brand, expectedUpdateBrandData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedUpdateBrandData)(req, res, next);
}

const validateUpgradeBrandOwnerSchema = createSchemaBuilder()
    .field('newPlan', { type: 'number', required: true, value: SubscriptionPlan.FREE })
    .build();
export const validateUgradeSubscription = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;


    const result = validateObjectStrict(data, validateUpgradeBrandOwnerSchema);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result,
        });
    }

    if (!Object.values(SubscriptionPlan).includes(data.newPlan)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid subscription plan.',
            expectedFormat: SUBSCRIPTION_PLANS
        });
    }

    extractSchemaFieldsMiddleware(validateUpgradeBrandOwnerSchema)(req, res, next);
}
