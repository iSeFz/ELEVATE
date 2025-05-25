import { Request, Response, NextFunction } from 'express';
import { validateObjectStructure } from './common.js';
import { CartItem, cartItemDataValidators } from '../../types/models/customer.js';

const expectedAddToCartData: Partial<CartItem> = {
    productId: "String",
    variantId: "String",
    quantity: 1
};
/**
 * Required data:
 * - productId: String - ID of the product
 * - variantId: String - ID of the specific product variant
 * - quantity: Number (optional, defaults to 1) - Quantity to add
 */
export const validateAddToCart = (req: Request, res: Response, next: NextFunction) => {
    // Check if the overall structure matches
    if (!validateObjectStructure(req.body, expectedAddToCartData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expectedAddToCartData
        });
    }
    const isCartItemValid = cartItemDataValidators(req.body as CartItem);
    if (!isCartItemValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid cart item data types.',
            expectedFormat: expectedAddToCartData
        });
    }

    next();
};

/**
 * Required Parameters:
 * - id: String - ID of the cart item to update
 * Required data:
 * - quantity: Number - New quantity for the item
 */
export const validateUpdateCartItem = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Item ID is required'
        });
    }

    if (quantity === undefined) {
        return res.status(400).json({
            status: 'error',
            message: 'Quantity is required'
        });
    }

    if (quantity && (isNaN(quantity) || quantity <= 0)) {
        return res.status(400).json({
            status: 'error',
            message: 'Valid quantity greater than 0 is required'
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
