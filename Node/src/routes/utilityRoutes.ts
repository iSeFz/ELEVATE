import express from 'express';
import * as UtilitiesController from '../controllers/utilityControllers.js';
import * as AuthController from '../controllers/authControllers.js';
import * as UtilitiesValidators from '../middleware/validators/utilities.js';
import { authenticate } from '../middleware/auth.js';


const router = express.Router();

router.get('/address-coordinates', UtilitiesController.getAddressCoordinates);

router.post('/try-before-you-buy',
    authenticate,
    UtilitiesValidators.validateTryOnRequest,
    UtilitiesController.tryBeforeYouBuy);
router.post('/send-password-reset', AuthController.sendPasswordResetEmail);
router.post('/confirm-password-reset', AuthController.confirmPasswordReset);
router.post('/refresh-token', AuthController.refreshToken);

export default router;