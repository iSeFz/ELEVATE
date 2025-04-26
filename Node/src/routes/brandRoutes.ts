import express from 'express';
import * as BrandController from '../controllers/brandController.js';
import { authenticate, authorize, authorizeBrandAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrand);
router.get('/name', BrandController.getBrandByName);

// Protected routes - brand owners can update their own brands
router.post('/', authenticate, authorize(['admin', 'staff', 'brandOwner']), BrandController.addBrand);
router.put('/:id', authenticate, authorizeBrandAccess, BrandController.updateBrand);
router.delete('/:id', authenticate, authorizeBrandAccess, BrandController.deleteBrand);

export default router;