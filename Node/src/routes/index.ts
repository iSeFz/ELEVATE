import express from 'express';
import ProductRoutes from './productRoutes.js';
import CustomerRoutes from './customerRoutes.js';
import BrandRoutes from './brandRoutes.js';
import ReviewRoutes from './reviewRoutes.js';
import OrderRoutes from './orderRoutes.js';
import StaffRoutes from './staffRoutes.js';
import BrandOwnerRoutes from './brandOwnerRoutes.js';
import SwaggerRoutes from './swaggerRoutes.js';
import { getCurrentUser, sendPasswordResetEmail, confirmPasswordReset } from '../controllers/authControllers.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, getCurrentUser);

router.post('/send-password-reset', sendPasswordResetEmail);
router.post('/confirm-password-reset', confirmPasswordReset);

// API documentation
router.use('/docs', SwaggerRoutes);

// Core API routes
router.use('/products', ProductRoutes);
router.use('/reviews', ReviewRoutes);
router.use('/customers', CustomerRoutes);
router.use('/brands', BrandRoutes);
router.use('/orders', OrderRoutes);

// User type specific routes
router.use('/staff', StaffRoutes);
router.use('/brand-owners', BrandOwnerRoutes);

export default router;