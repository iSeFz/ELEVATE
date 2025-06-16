import express from 'express';
import * as UtilitiesController from '../controllers/utilityControllers.js';
import * as AuthController from '../controllers/authControllers.js';


const router = express.Router();

router.get('/address-coordinates', UtilitiesController.getAddressCoordinates);
router.post('/send-password-reset', AuthController.sendPasswordResetEmail);
router.post('/confirm-password-reset', AuthController.confirmPasswordReset);
router.post('/refresh-token', AuthController.refreshToken);

export default router;