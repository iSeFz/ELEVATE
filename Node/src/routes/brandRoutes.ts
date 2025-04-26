import express from 'express';
import * as BrandController from '../controllers/brandController.js';
import { authenticate, authorize, authorizeBrandAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrand);
router.get('/name', BrandController.getBrandByName);

// Protected routes - brand owners can update their own brands

// We don't need this endpoint as creating brands is handled by brand owner post endpoint
// router.post('/', authenticate, authorize(['admin', 'staff', 'brandOwner']), BrandController.addBrand);
// router.delete('/:id', authenticate, authorizeBrandAccess, BrandController.deleteBrand);

router.put('/:id', authenticate, authorizeBrandAccess, BrandController.updateBrand);

export default router;