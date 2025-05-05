import express from 'express';
import { authenticate, authorize, authorizeBrandOwnerProfileAccess } from '../middleware/auth.js';
import { brandOwnerLogin, brandOwnerSignup } from '../controllers/authControllers.js';
import * as BrandOwnerController from '../controllers/brandOwnerController.js';

const router = express.Router();

// Auth routes for brand owners
router.post('/login', brandOwnerLogin);
router.post('/signup', brandOwnerSignup);

// Brand owner management routes
router.get('/', authenticate, authorize(['admin']), BrandOwnerController.getAllBrandOwners);
router.get('/:id', authenticate, authorizeBrandOwnerProfileAccess, BrandOwnerController.getBrandOwner);
router.put('/:id', authenticate, authorizeBrandOwnerProfileAccess, BrandOwnerController.updateBrandOwner);
router.delete('/:id', authenticate, authorize(['admin']), BrandOwnerController.deleteBrandOwner);

export default router;