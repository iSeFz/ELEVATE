import express from 'express';
import ProductRoutes from './productRoutes.js';
import CustomerRoutes from './customerRoutes.js';
import BrandRoutes from './brandRoutes.js';
import SwaggerRoutes from './swaggerRoutes.js';
import { signup, login } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.use('/docs', SwaggerRoutes);
router.use('/products', ProductRoutes);
router.use('/customers', CustomerRoutes);
router.use('/brands', BrandRoutes);

export default router;