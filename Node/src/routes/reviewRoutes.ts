import express from 'express';
import * as ReviewController from '../controllers/reviewController.js';

const router = express.Router();

// Get all reviews
router.get('/', ReviewController.getAllReviews);

// Get review by ID
router.get('/:id', ReviewController.getReview);

// Get reviews by product ID
router.get('/by-product', ReviewController.getReviewsByProduct);

// Get reviews by customer ID
router.get('/by-customer', ReviewController.getReviewsByCustomer);

// Add new review
router.post('/', ReviewController.addReview);

// Update review
router.put('/:id', ReviewController.updateReview);

// Delete review
router.delete('/:id', ReviewController.deleteReview);

export default router;