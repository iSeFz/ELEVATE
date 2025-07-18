import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlist.js';
import * as productService from '../services/product.js';

/**
 * User must be authenticated to access the wishlist.
 */
export const getWishlist = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;

        if (!customerId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        // Validate page number
        if (isNaN(page) || page < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid page number. Page must be a positive integer.'
            });
        }

        const results = await wishlistService.getWishlist(customerId, page);

        return res.status(200).json({
            status: 'success',
            data: results.items,
            pagination: results.pagination
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * User must be authenticated to add items to the wishlist.
 * 
 * Required data:
 * - productId: String - ID of the product
 */
export const addToWishlist = async (req: Request, res: Response) => {
    try {
        const customerId = req.user!.id;
        const { productId } = req.body;

        const updatedWishlist = await wishlistService.addToWishlist(customerId, productId);
        await productService.increaseProductWishlistCount(productId);

        return res.status(200).json({
            status: 'success',
            message: 'Item added to wishlist',
            data: updatedWishlist
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * User must be authenticated to remove items from the wishlist.
 */
export const removeFromWishlist = async (req: Request, res: Response) => {
    try {
        const customerId = req.user!.id;
        const { productId } = req.params;

        const updatedWishlist = await wishlistService.removeFromWishlist(customerId, productId);

        return res.status(200).json({
            status: 'success',
            message: 'Item removed from wishlist',
            data: updatedWishlist
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * User must be authenticated to clear the wishlist.
 */
export const clearWishlist = async (req: Request, res: Response) => {
    try {
        const customerId = req.user!.id;

        const emptyWishlist = await wishlistService.clearWishlist(customerId);

        return res.status(200).json({
            status: 'success',
            message: 'Wishlist cleared successfully',
            data: emptyWishlist
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};