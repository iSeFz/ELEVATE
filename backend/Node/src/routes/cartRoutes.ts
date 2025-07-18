import express from 'express';
import * as CartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import * as CartValidators from '../middleware/validators/cart.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/items', CartValidators.validateAddToCart, CartController.addToCart);
router.put('/items/:id', CartValidators.validateUpdateCartItem, CartController.updateCartItem);
router.delete('/items/:id', CartValidators.validateRemoveFromCart, CartController.removeFromCart);
router.delete('/', CartController.clearCart);

export default router;
