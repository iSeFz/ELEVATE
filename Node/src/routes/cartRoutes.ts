import express from 'express';
import * as CartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import * as CartValidators from '../middleware/validators/cart.js';

const router = express.Router();

router.get('/', authenticate, CartController.getCart);
router.post('/items', authenticate, CartValidators.validateAddToCart, CartController.addToCart);
router.put('/items/:id', authenticate, CartValidators.validateUpdateCartItem, CartController.updateCartItem);
router.delete('/items/:id', authenticate, CartValidators.validateRemoveFromCart, CartController.removeFromCart);
router.delete('/', authenticate, CartController.clearCart);

export default router;
