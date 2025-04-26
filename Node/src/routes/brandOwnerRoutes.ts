import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { brandOwnerLogin } from '../controllers/authControllers.js';
import * as BrandOwnerController from '../controllers/brandOwnerController.js';

const router = express.Router();

// Auth routes for brand owners
router.post('/login', brandOwnerLogin);

// Brand owner management routes
router.get('/', authenticate, authorize(['admin']), BrandOwnerController.getAllBrandOwners);
router.get('/:id', authenticate, authorize(['admin', 'brandOwner']), BrandOwnerController.getBrandOwner);
router.get('/by-brand/:brandId', authenticate, BrandOwnerController.getBrandOwnerByBrand);
router.put('/:id', authenticate, authorize(['admin', 'brandOwner']), BrandOwnerController.updateBrandOwner);
router.delete('/:id', authenticate, authorize(['admin']), BrandOwnerController.deleteBrandOwner);

export default router;