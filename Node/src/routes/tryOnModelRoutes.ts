import { Router } from 'express';
import { TryOnController } from '../controllers/tryOnModelController.js';
import { authenticate } from '../middleware/auth.js';
import { validateTryOnRequest } from '../middleware/validators/tryOnModel.js';

const router = Router();

// Start virtual try-on
router.post(
    '/start',
    authenticate,
    validateTryOnRequest,
    TryOnController.startTryOn
);

// Webhook endpoint for Replicate (no auth needed)
router.post('/webhook', TryOnController.handleWebhook);

// Get specific try-on request
router.get(
    '/request/:requestId',
    authenticate,
    TryOnController.getTryOnRequest
);

// Get user's try-on history
router.get(
    '/history',
    authenticate,
    TryOnController.getTryOnHistory
);

// Delete try-on request
router.delete(
    '/request/:requestId',
    authenticate,
    TryOnController.deleteTryOnRequest
);

// Cancel try-on prediction
router.post(
    '/request/:requestId/cancel',
    authenticate,
    TryOnController.cancelTryOn
);

export default router;