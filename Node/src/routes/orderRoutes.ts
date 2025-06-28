import express from 'express';
import * as OrderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin access to all orders, with optional filtering by status or productId
router.get('/',
    authenticate,
    authorize(['admin']),
    OrderController.getAllOrders);

// Order CRON Jobs
router.put('/cleanup-expired',
    authenticate,
    authorize(['admin']),
    OrderController.cleanupExpiredOrders);
router.put('/progress-statuses',
    authenticate,
    authorize(['admin']),
    OrderController.progressOrderStatuses);

// Only admins can delete orders
router.delete('/:id',
    authenticate,
    authorize(['admin']),
    OrderController.deleteOrder);

export default router;