import express from 'express';
import * as OrderController from '../controllers/orderController.js';
import { authenticate, authorize, authorizeOrderAccess } from '../middleware/auth.js';

const router = express.Router();

// Staff/admin access to all orders
router.get('/', authenticate, authorize(['admin', 'staff']), OrderController.getAllOrders);

// Get orders by status - staff/admin only
router.get('/status/:status', authenticate, authorize(['admin', 'staff']), OrderController.getOrdersByStatus);

// Get orders containing a specific product - staff/admin only
router.get('/by-product/:productId', authenticate, authorize(['admin', 'staff']), OrderController.getOrdersByProduct);

// Users can access their own orders, staff/admin can access any order
router.get('/:id', authenticate, authorizeOrderAccess, OrderController.getOrder);

// Any authenticated user can create an order
router.post('/', authenticate, OrderController.addOrder);

// Staff/admin can update orders, or users can update their own orders
router.put('/:id', authenticate, authorizeOrderAccess, OrderController.updateOrder);

// Staff/admin can update order status
router.patch('/:id/status', authenticate, authorize(['admin', 'staff']), OrderController.updateOrderStatus);

// Cancel an order - users can cancel their own orders, staff/admin can cancel any order
router.patch('/:id/cancel', authenticate, authorizeOrderAccess, OrderController.cancelOrder);

// Only admins can delete orders
router.delete('/:id', authenticate, authorize(['admin']), OrderController.deleteOrder);

export default router;