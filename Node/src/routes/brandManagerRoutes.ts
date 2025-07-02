import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { brandManagerLogin, brandManagerSignup } from '../controllers/authControllers.js';
import * as BrandManagerController from '../controllers/brandManagerController.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as BrandManagerValidators from '../middleware/validators/brandManager.js';

const router = express.Router();

router.post('/login', AuthValidators.validateLogin, brandManagerLogin);
router.post('/signup', BrandManagerValidators.validateSignupBrandManager, brandManagerSignup);

router.get('/me',
    authenticate,
    authorize(['admin', 'brandManager']),
    BrandManagerController.getBrandManager);
router.put('/me',
    authenticate,
    BrandManagerValidators.validateUpdateBrandManager,
    authorize(['admin', 'brandManager']),
    BrandManagerController.updateBrandManager);

// Brand Managers management routes (admin only)
router.get('/', authenticate, authorize(['admin']), BrandManagerController.getAllBrandManager);
router.delete('/me', authenticate, authorize(['admin']), BrandManagerController.deleteBrandManager);

export default router;