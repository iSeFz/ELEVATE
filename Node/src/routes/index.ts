import express from 'express';
import ProductRoutes from './productRoutes.js';
import CustomerRoutes from './customerRoutes.js';
import BrandRoutes from './brandRoutes.js';
import ProductVariantRoutes from './productVariantRoutes.js';
import ReviewRoutes from './reviewRoutes.js';
import OrderRoutes from './orderRoutes.js';
import SwaggerRoutes from './swaggerRoutes.js';
import { signup, login, staffSignup } from '../controllers/authControllers.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/staff/signup', staffSignup);

// API documentation
router.use('/docs', SwaggerRoutes);

// Core API routes
router.use('/products', ProductRoutes);
router.use('/product-variants', ProductVariantRoutes);
router.use('/reviews', ReviewRoutes);
router.use('/customers', CustomerRoutes);
router.use('/brands', BrandRoutes);
router.use('/orders', OrderRoutes);

export default router;