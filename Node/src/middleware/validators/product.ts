import { Request, Response, NextFunction } from 'express';
import { validateObjectStructure } from './common.js';
import { Product, productDataValidators, ProductVariant, productVariantDataValidators } from '../../types/models/product.js';

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
    reviewSummary: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
        },
        reviewIds: ["String"]
    },
};
const expectedAddProductData: Partial<Product> = {
    name: "String",
    category: "String",
    description: "String",
    material: "String",
};
/**
 * Required data:
 * - name: String - Name of the product
 * - category: String - Category of the product
 * - description: String - Description of the product
 * - material: String - Material of the product
 */
export const validateAddProduct = (req: Request, res: Response, next: NextFunction) => {
    // Check if the overall structure matches
    if (!validateObjectStructure(req.body, expectedAddProductData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expectedAddProductData
        });
    }
    const isProductValid = productDataValidators(req.body as Product);
    if (!isProductValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid product data types.',
            expectedFormat: expectedAddProductData
        });
    }

    next();
};

const expectedUpdateProductData: Partial<Product> = {
    name: "String",
    brandName: "String",
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
    }]
};
/**
 * Data that can be updated:
    * - name: String - Name of the product
    * - brandName: String - Brand name of the product
    * - category: String - Category of the product
    * - description: String - Description of the product
    * - material: String - Material of the product
    * - reviewSummary: Object - Review summary of the product
      *  - averageRating: Number - Average rating of the product
      *  - totalReviews: Number - Total number of reviews
      *  - ratingDistribution: Object - Rating distribution of the product
        *  - '1': Number - Number of 1-star reviews
        *  - '2': Number - Number of 2-star reviews
        *  - '3': Number - Number of 3-star reviews
        *  - '4': Number - Number of 4-star reviews
        *  - '5': Number - Number of 5-star reviews
      * - reviewIds: Array - IDs of the reviews
    * - variants: Array - Variants of the product
      *  - colors: Array - Colors of the variant
      * - discount: Number - Discount of the variant
      * - images: Array - Images of the variant
      * - price: Number - Price of the variant
      * - size: String - Size of the variant
      * - stock: Number - Stock of the variant
 */
export const validateUpdateProduct = (req: Request, res: Response, next: NextFunction) => {
    // Check if the overall structure matches
    if (!validateObjectStructure(req.body, expectedUpdateProductData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedUpdateProductData
        });
    }
    const isProductValid = productDataValidators(req.body as Product);
    if (!isProductValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid product data types.',
            expectedFormat: expectedUpdateProductData
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
