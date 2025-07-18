import express from 'express';
import * as BrandController from '../controllers/brandController.js';
import { authorize, authenticate } from '../middleware/auth.js';
import * as BrandValidators from '../middleware/validators/brand.js';

const router = express.Router();

// Brand owner-specific routes
router.get('/me', authenticate, BrandController.getMyBrand);
router.put('/me',
    authenticate,
    BrandValidators.validateUpdateBrand,
    BrandController.updateMyBrand);

router.post('/me/upgrade-subscription',
    authenticate,
    authorize(['admin']), // Only admin can access
    BrandValidators.validateUgradeSubscription,
    BrandController.upgradeSubscription);

// Public route to get all subscription plans
router.get('/subscription-plans', BrandController.getAllSubscriptionPlans);

// Public routes - no authentication required
router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrand);



export default router;