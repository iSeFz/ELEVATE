import express from 'express';
import ProductRoutes from './productRoutes.ts';
import CustomerRoutes from './customerRoutes.ts';
import BrandRoutes from './brandRoutes.ts';
import { signup } from '../controllers/authControllers.ts';

const router = express.Router();

router.post('/signup', signup);

router.use('/products', ProductRoutes);
router.use('/customers', CustomerRoutes);
router.use('/brands', BrandRoutes);

export default router;