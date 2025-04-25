import { Review } from '../../types/models/review.js';

export const checkMissingReviewData = (review: any) => {
    const currentReview = review as Review;
    if (currentReview.content == null || currentReview.customer == null || 
        currentReview.rating == null) {
        return 'Review content, customer reference, and rating are required';
    }
    if (currentReview.rating < 1 || currentReview.rating > 5) {
        return 'Rating must be between 1 and 5';
    }
    return null;
};

export const checkMissingReviewUpdateData = (review: any) => {
    if (Object.keys(review).length === 0) {
        return 'No data provided for update';
    }
    return null;
};