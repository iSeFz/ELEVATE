import { Request, Response } from 'express';
import * as cartService from '../services/cart.js';
import { CartItem } from '../types/models/customer.js';

/**
 * User must be authenticated to access the cart.
 */
export const getCart = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;

        if (!customerId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        const cart = await cartService.getCart(customerId);

        return res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * User must be authenticated to add items to the cart.
 * 
 * Required data:
 * - productId: String - ID of the product
 * - variantId: String - ID of the specific product variant
 * - color: String - Color of the product
 * - quantity: Number (optional, defaults to 1) - Quantity to add
 */
export const addToCart = async (req: Request, res: Response) => {
    try {
        const customerId = req.user!.id;
        const cartItem = req.body as Partial<CartItem>;
        const updatedCart = await cartService.addToCart(customerId, cartItem);

        return res.status(200).json({
            status: 'success',
            message: 'Item added to cart',
            data: updatedCart
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * User must be authenticated to update items in the cart.
 * 
 * Required data:
 * - id: String - ID of the cart item to update
 * - quantity: Number - New quantity for the item
 */
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const customerId = req.user!.id;
        const { id } = req.params;
        const { quantity, color } = req.body;

        const updatedCart = await cartService.updateCartItem(
            customerId,
            id,
            { quantity, color }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Cart item quantity updated',
            data: updatedCart
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * User must be authenticated to remove items from the cart.
 */
export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const customerId = req.user!.id;
        const { id } = req.params;

        const updatedCart = await cartService.removeFromCart(customerId, id);

        return res.status(200).json({
            status: 'success',
            message: 'Item removed from cart',
            data: updatedCart
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * User must be authenticated to clear the cart.
 */
export const clearCart = async (req: Request, res: Response) => {
    try {
        const customerId = req.user!.id;

        const emptyCart = await cartService.clearCart(customerId);

        return res.status(200).json({
            status: 'success',
            message: 'Cart cleared successfully',
            data: emptyCart
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
