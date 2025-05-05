import express from 'express';
import * as ReviewController from '../controllers/reviewController.js';
import { authenticate, authorizeReviewAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReview);
router.get('/by-product', ReviewController.getReviewsByProduct);

// Users can view their own reviews
router.get('/by-customer', authenticate, ReviewController.getReviewsByCustomer);

// Users must be authenticated to create reviews
router.post('/', authenticate, ReviewController.addReview);

// Users can update their own reviews, admins can update any
router.put('/:id', authenticate, authorizeReviewAccess, ReviewController.updateReview);

// Only admins can delete reviews, or users can delete their own
router.delete('/:id', authenticate, authorizeReviewAccess, ReviewController.deleteReview);

export default router;