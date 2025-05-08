import express from 'express';
import * as CartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, CartController.getCart);
router.post('/items', authenticate, CartController.addToCart);
router.put('/items/:id', authenticate, CartController.updateCartItem);
router.delete('/items/:id', authenticate, CartController.removeFromCart);
router.delete('/', authenticate, CartController.clearCart);

export default router;
