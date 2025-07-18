import express from 'express';
import * as ReviewController from '../controllers/reviewController.js';
import * as ReviewValidators from '../middleware/validators/review.js';
import { authenticate, authorizeReviewAccess } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Public routes - no authentication required
router.get('/:id', ReviewController.getReview);

// Users can update their own reviews, admins can update any
router.put('/:id',
    authenticate,
    authorizeReviewAccess,
    ReviewValidators.validateUpdateReview,
    ReviewController.updateReview);

// Only admins can delete reviews, or users can delete their own
router.delete('/:id',
    authenticate,
    authorizeReviewAccess,
    ReviewValidators.validateDeleteReview,
    ReviewController.deleteReview);

export default router;