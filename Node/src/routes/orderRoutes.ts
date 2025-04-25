import express from 'express';
import * as OrderController from '../controllers/orderController.js';

const router = express.Router();

// Get all orders
router.get('/', OrderController.getAllOrders);

// Get order by ID
router.get('/:id', OrderController.getOrder);

// Get orders by customer ID
router.get('/by-customer', OrderController.getOrdersByCustomer);

// Add new order
router.post('/', OrderController.addOrder);

// Update order
router.put('/:id', OrderController.updateOrder);

// Update order status
router.patch('/:id/status', OrderController.updateOrderStatus);

// Delete order
router.delete('/:id', OrderController.deleteOrder);

export default router;