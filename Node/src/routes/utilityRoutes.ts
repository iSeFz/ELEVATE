import express from 'express';
import * as UtilitiesController from '../controllers/utilityControllers.js';
import * as AuthController from '../controllers/authControllers.js';
import { validateFCMToken } from '../middleware/validators/notification.js';
import { saveFCMToken } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import TryOnModelRoutes from './tryOnModelRoutes.js';

const router = express.Router();

router.use('/try-on', TryOnModelRoutes);
router.get('/address-coordinates', UtilitiesController.getAddressCoordinates);

router.post('/send-password-reset', AuthController.sendPasswordResetEmail);
router.post('/confirm-password-reset', AuthController.confirmPasswordReset);
router.post('/refresh-token', AuthController.refreshToken);

// Save FCM token for notifications
router.post(
    '/fcm-token',
    authenticate,
    validateFCMToken,
    saveFCMToken
);

export default router;