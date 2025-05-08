import express from 'express';
import { authenticate, authorize, authorizeBrandOwnerProfileAccess } from '../middleware/auth.js';
import { brandOwnerLogin, brandOwnerSignup } from '../controllers/authControllers.js';
import * as BrandOwnerController from '../controllers/brandOwnerController.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as BrandOwnerValidators from '../middleware/validators/brandOwner.js';

const router = express.Router();

// Auth routes for brand owners
router.post('/login', AuthValidators.validateLogin, brandOwnerLogin);
router.post('/signup', BrandOwnerValidators.validateSignupBrandOwner, brandOwnerSignup);

// Brand owner management routes
router.get('/', authenticate, authorize(['admin']), BrandOwnerController.getAllBrandOwners);
router.get('/:id', authenticate, authorizeBrandOwnerProfileAccess, BrandOwnerController.getBrandOwner);
router.put('/:id', authenticate, authorizeBrandOwnerProfileAccess, BrandOwnerValidators.validateUpdateBrandOwner, BrandOwnerController.updateBrandOwner);
router.delete('/:id', authenticate, authorize(['admin']), BrandOwnerValidators.validateDeleteBrandOwner, BrandOwnerController.deleteBrandOwner);

export default router;