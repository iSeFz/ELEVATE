import express from 'express';
import ProductRoutes from './productRoutes.js';
import CustomerRoutes from './customerRoutes.js';
import BrandRoutes from './brandRoutes.js';
import ReviewRoutes from './reviewRoutes.js';
import OrderRoutes from './orderRoutes.js';
import StaffRoutes from './staffRoutes.js';
import BrandOwnerRoutes from './brandOwnerRoutes.js';
import SwaggerRoutes from './swaggerRoutes.js';
import ScriptsRoutes from './scriptsRoutes.js';
import UtilityRoutes from './utilityRoutes.js';

const router = express.Router();

// API documentation
router.use('/docs', SwaggerRoutes);

// Utility routes
router.use('/utilities', UtilityRoutes)

// Core API routes
router.use('/products', ProductRoutes);
router.use('/reviews', ReviewRoutes);
router.use('/customers', CustomerRoutes);
router.use('/brands', BrandRoutes);
router.use('/orders', OrderRoutes);

// Migration scripts
router.use('/scripts', ScriptsRoutes);

// User type specific routes
router.use('/staff', StaffRoutes);
router.use('/brand-owners', BrandOwnerRoutes);

export default router;