import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { brandOwnerLogin, brandOwnerSignup } from '../controllers/authControllers.js';
import * as BrandOwnerController from '../controllers/brandOwnerController.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as BrandOwnerValidators from '../middleware/validators/brandOwner.js';

const router = express.Router();

// Auth routes for brand owners
router.post('/login', 
    AuthValidators.validateLogin, brandOwnerLogin);
router.post('/signup', 
    BrandOwnerValidators.validateSignupBrandOwner, brandOwnerSignup);

// Brand owner management routes
router.get('/', 
    authenticate, 
    authorize(['admin']), 
    BrandOwnerController.getAllBrandOwners);
router.get('/me', 
    authenticate, 
    BrandOwnerController.getBrandOwner);
router.put('/me', 
    authenticate, 
    BrandOwnerValidators.validateUpdateBrandOwner, 
    BrandOwnerController.updateBrandOwner);
router.delete('/me', 
    authenticate, authorize(['admin']), 
    BrandOwnerController.deleteBrandOwner);

export default router;