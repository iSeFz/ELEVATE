import express from 'express';
import * as OrderController from '../controllers/orderController.js';
import { authenticate, authorize, authorizeOrderAccess } from '../middleware/auth.js';

const router = express.Router();

// Staff/admin access to all orders
router.get('/', authenticate, authorize(['admin', 'staff']), OrderController.getAllOrders);

// Users can access their own orders, staff/admin can access any order
router.get('/:id', authenticate, authorizeOrderAccess, OrderController.getOrder);

// Users can view their own orders
router.get('/by-customer', authenticate, OrderController.getOrdersByCustomer);

// Any authenticated user can create an order
router.post('/', authenticate, OrderController.addOrder);

// Staff/admin can update orders, or users can update their own orders
router.put('/:id', authenticate, authorizeOrderAccess, OrderController.updateOrder);

// Staff/admin can update order status
router.patch('/:id/status', authenticate, authorize(['admin', 'staff']), OrderController.updateOrderStatus);

// Only admins can delete orders
router.delete('/:id', authenticate, authorize(['admin']), OrderController.deleteOrder);

export default router;