import express from 'express';
import * as WishlistController from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';
import * as WishlistValidators from '../middleware/validators/wishlist.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

// Get the wishlist
router.get('/',
    WishlistValidators.validateGetWishlist,
    WishlistController.getWishlist);

// Add an item to the wishlist
router.post('/items',
    WishlistValidators.validateAddToWishlist,
    WishlistController.addToWishlist);

// Remove an item from the wishlist
router.delete('/items/:productId',
    WishlistValidators.validateRemoveFromWishlist,
    WishlistController.removeFromWishlist);

// Clear the wishlist
router.delete('/',
    WishlistController.clearWishlist);

export default router;