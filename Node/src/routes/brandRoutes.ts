import express from 'express';
import * as BrandController from '../controllers/brandController.js';
import { authenticate, authorizeBrandAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrand);
router.get('/name', BrandController.getBrandByName);

router.put('/:id', authenticate, authorizeBrandAccess, BrandController.updateBrand);

export default router;