import { Request, Response } from 'express';
import * as cartService from '../services/cart.js';
import { CartItem } from '../types/models/customer.js';

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

export const addToCart = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;

        if (!customerId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        const cartItem = req.body as Partial<CartItem>;

        if (!cartItem.productId || !cartItem.variantId) {
            return res.status(400).json({
                status: 'error',
                message: 'Product ID and variant ID are required'
            });
        }

        if (!cartItem.quantity || cartItem.quantity <= 0) {
            cartItem.quantity = 1; // Default to 1 if not specified or invalid
        }

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

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;
        const { productId, variantId } = req.params;
        const { quantity } = req.body;

        if (!customerId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        if (!productId || !variantId) {
            return res.status(400).json({
                status: 'error',
                message: 'Product ID and variant ID are required'
            });
        }

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid quantity greater than 0 is required'
            });
        }

        const updatedCart = await cartService.updateCartItem(
            customerId,
            productId,
            variantId,
            Number(quantity)
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

export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;
        const { productId, variantId } = req.params;

        if (!customerId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        if (!productId || !variantId) {
            return res.status(400).json({
                status: 'error',
                message: 'Product ID and variant ID are required'
            });
        }

        const updatedCart = await cartService.removeFromCart(customerId, productId, variantId);

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

export const clearCart = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;

        if (!customerId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

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
