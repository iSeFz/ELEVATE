import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';


const expectedAddToWishlistData = createSchemaBuilder<{ productId: string }>()
    .field('productId', { type: 'string', required: true, minLength: 1, maxLength: 30 })
    .build();
export const validateAddToWishlist = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    const result = validateObjectStrict(data, expectedAddToWishlistData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedAddToWishlistData)(req, res, next);
};

/**
 * Required Parameters:
 * - productId: String - ID of the product to remove
 */
export const validateRemoveFromWishlist = (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    if (!productId || typeof productId !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Product ID is required'
        });
    }

    next();
};

/**
 * Optional query parameters:
 * - page: Number - Page number for pagination (default: 1)
 */
export const validateGetWishlist = (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;

    if (req.query.page && (isNaN(page) || page < 1)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid page number. Page must be a positive integer.'
        });
    }

    next();
};
