import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, validateObjectStrict } from './builder.js';
import { CartItem } from '../../types/models/customer.js';

const expectedAddToCartData = createSchemaBuilder<CartItem>()
    .field('productId', { type: 'string', required: true, value: '0123457890' })
    .field('variantId', { type: 'string', required: true, value: 'variant_67890' })
    .field('quantity', { type: 'number', required: true, value: 1 })
    .build();
export const validateAddToCart = (req: Request, res: Response, next: NextFunction) => {
    const cartItem: CartItem = req.body;
    const result = validateObjectStrict(cartItem, expectedAddToCartData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
};

const expectedUpdateCartItemData = createSchemaBuilder<CartItem>()
    .field('quantity', { type: 'number', required: true, value: 1 })
    .build();
export const validateUpdateCartItem = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    const result = validateObjectStrict(data, expectedUpdateCartItemData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
};

/**
 * Required Parameters:
 * - id: String - ID of the cart item to remove
 */
export const validateRemoveFromCart = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Item ID is required'
        });
    }

    next();
};
