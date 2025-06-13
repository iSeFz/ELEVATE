import e, { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, Schema, validateObjectStrict } from './builder.js';
import { Product, ProductVariant } from '../../types/models/product.js';
import { getAllCategoriesDetails } from '../../config/categories.js';
import { productVariantSchema } from './common.js';

const expectedProductData = createSchemaBuilder<Product>()
    .field('name', { type: 'string', required: true, minLength: 1, maxLength: 100, value: 'Sample Product' })
    .field('category', { type: 'string', required: true, value: getAllCategoriesDetails().join(' / '), })
    .field('description', { type: 'string', required: true, minLength: 1, maxLength: 500, value: 'This is a sample product description.' })
    .field('material', { type: 'string', required: true, minLength: 1, maxLength: 50, value: 'Cotton' })
    .field('department', {
        type: 'array',
        required: true,
        items: { type: 'string', minLength: 1, maxLength: 30, value: "Men - Women - Unisex - Kids" }
    })
    .field('variants', { type: 'array', required: true, minLength: 1, items: { type: 'object', fields: productVariantSchema } })
    .build();
export const validateAddProduct = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as Product;
    const result = validateObjectStrict(data, expectedProductData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
};

const expectedUpdateProductData: Schema = {}
for (const key in expectedProductData) {
    expectedUpdateProductData[key] = { ...expectedProductData[key] };
    expectedUpdateProductData[key].required = false; // Make all fields optional for update
    if (key === 'variants') {
        expectedUpdateProductData[key].minLength = 0; // Allow empty variants array for update
        if (
            expectedUpdateProductData[key].items &&
            expectedUpdateProductData[key].items.fields
        ) {
            // If you need to iterate over the fields object, use Object.entries or Object.keys
            for (const variant in (expectedUpdateProductData[key].items.fields)) {
                expectedUpdateProductData[key].items.fields[variant].required = false;
            }
        }
    }
}
export const validateUpdateProduct = (req: Request, res: Response, next: NextFunction) => {
    const product = req.body as Product;
    const result = validateObjectStrict(product, expectedUpdateProductData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
};

const expectedProductvariantData = productVariantSchema;
export const validateAddProductVariant = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedProductvariantData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}


const expectedUpdateProductVariantData = {} as Schema;
for (const key in expectedProductvariantData) {
    expectedUpdateProductVariantData[key] = { ...expectedProductvariantData[key] };
    expectedUpdateProductVariantData[key].required = false; // Make all fields optional for update
    if (key === 'variants') {
        expectedUpdateProductVariantData[key].minLength = 0; // Allow empty variants array for update
    }
}
for (const key in expectedUpdateProductVariantData) {
    expectedUpdateProductVariantData[key].required = false; // Make all fields optional for update
    if (key === 'images') {
        expectedUpdateProductVariantData[key].minLength = 0; // Allow empty images array for update
    }
}
export const validateUpdateProductVariant = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as ProductVariant;
    const result = validateObjectStrict(data, expectedUpdateProductVariantData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}

export const validateDeleteProductVariant = (req: Request, res: Response, next: NextFunction) => {
    const productID = req.params.productId;
    const variantID = req.params.variantId;

    if (!productID || !variantID) {
        return res.status(400).json({
            status: 'error',
            message: 'Product ID and variant ID are required'
        });
    }

    next();
}
