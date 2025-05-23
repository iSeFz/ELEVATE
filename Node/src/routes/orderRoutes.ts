import express from 'express';
import * as OrderController from '../controllers/orderController.js';
import { authenticate, authorize, authorizeOrderAccess } from '../middleware/auth.js';

const router = express.Router();

// Staff/admin access to all orders, with optional filtering by status or productId
router.get('/', authenticate, authorize(['admin', 'staff']), OrderController.getAllOrders);

// Only admins can delete orders
router.delete('/:id', authenticate, authorize(['admin']), OrderController.deleteOrder);

export default router;