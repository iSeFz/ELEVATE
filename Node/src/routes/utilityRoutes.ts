import express from 'express';
import * as UtilitiesController from '../controllers/utilityControllers.js';
import * as AuthController from '../controllers/authControllers.js';
import * as UtilitiesValidators from '../middleware/validators/utilities.js';
import { searchByImage } from '../controllers/imageSearchController.js';
import { validateImageSearchRequest } from '../middleware/validators/imageSearch.js';


const router = express.Router();

router.get('/address-coordinates', UtilitiesController.getAddressCoordinates);
router.get('/try-on', UtilitiesValidators.validateTryOnRequest, UtilitiesController.tryOn);

router.post('/send-password-reset', AuthController.sendPasswordResetEmail);
router.post('/confirm-password-reset', AuthController.confirmPasswordReset);
router.post('/refresh-token', AuthController.refreshToken);

router.get('/image-search', validateImageSearchRequest, searchByImage);


export default router;