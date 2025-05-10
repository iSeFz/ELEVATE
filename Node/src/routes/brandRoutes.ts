import express from 'express';
import * as BrandController from '../controllers/brandController.js';
import { authenticate, authorizeBrandAccess } from '../middleware/auth.js';
import * as BrandValidators from '../middleware/validators/brand.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrand);

router.put('/:id', authenticate, authorizeBrandAccess, BrandValidators.validateUpdateBrand, BrandController.updateBrand);

export default router;