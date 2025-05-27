import { Request, Response, NextFunction } from 'express';
import { validateObjectStructure } from './common.js';
import { Product, productDataValidators, ProductVariant, productVariantDataValidators } from '../../types/models/product.js';
import { CATEGORIES } from '../../config/categories.js';

const expectedProductData: Partial<Product> = {
    name: "String",
    category: "String",
    description: "String",
    material: "String",
    department: ["String"],
    variants: [{
        colors: ["String"],
        discount: 0,
        images: ["String"],
        price: 0,
        size: "String",
        stock: 0,
    }],
};
export const validateAddProduct = (req: Request, res: Response, next: NextFunction) => {
    // Check if the overall structure matches
    if (!validateObjectStructure(req.body, expectedProductData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expectedProductData
        });
    }

    if (!CATEGORIES.includes(req.body.category)) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`,
            expectedFormat: expectedProductData
        });
    }

    // Ensure that the variants array has at least one variant
    if (!req.body.variants || req.body.variants.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'At least one variant is required'
        });
    }

    next();
};

export const validateUpdateProduct = (req: Request, res: Response, next: NextFunction) => {
    // Check if the overall structure matches
    if (!validateObjectStructure(req.body, expectedProductData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedProductData
        });
    }
    const isProductValid = productDataValidators(req.body as Product);
    if (!isProductValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid product data types.',
            expectedFormat: expectedProductData
        });
    }

    next();
};


const expectedProductvariantData: ProductVariant = {
    colors: ["String"],
    discount: 0,
    images: ["String"],
    price: 0,
    size: "String",
    stock: 0,
}
/**
 * Required data:
 * - colors: Array - Colors of the variant
 * - discount: Number - Discount of the variant
 * - images: Array - Images of the variant
 * - price: Number - Price of the variant
 * - size: String - Size of the variant
 * - stock: Number - Stock of the variant
 */
export const validateAddProductVariant = (req: Request, res: Response, next: NextFunction) => {
    // Check if the overall structure matches
    if (!validateObjectStructure(req.body, expectedProductvariantData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expectedProductvariantData
        });
    }
    const isProductVariantValid = productVariantDataValidators(req.body as ProductVariant);
    if (!isProductVariantValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid product variant data types.',
            expectedFormat: expectedProductvariantData
        });
    }

    next();
}


/**
 * Data that can be updated:
 * - colors: Array - Colors of the variant
 * - discount: Number - Discount of the variant
 * - images: Array - Images of the variant
 * - price: Number - Price of the variant
 * - size: String - Size of the variant
 * - stock: Number - Stock of the variant
 */
export const validateUpdateProductVariant = (req: Request, res: Response, next: NextFunction) => {
    if (!validateObjectStructure(req.body, expectedProductvariantData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedProductvariantData
        });
    }

    const productID = req.params.productId;
    const variantID = req.params.variantId;
    const isProductVariantValid = productVariantDataValidators(req.body as ProductVariant);

    if (!productID || !variantID) {
        return res.status(400).json({
            status: 'error',
            message: 'Product ID and variant ID are required'
        });
    }
    if (!isProductVariantValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid product variant data types.',
            expectedFormat: expectedProductvariantData
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
