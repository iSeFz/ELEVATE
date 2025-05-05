import { Review } from '../../types/models/review.js';

export const checkMissingReviewData = (review: any) => {
    const currentReview = review as Review;
    if (currentReview.title == null || currentReview.content == null ||
        currentReview.customerId == null || currentReview.productId == null
        || currentReview.rating == null) {
        return 'Review title, content, customer id, product id, and rating are required';
    }
    if (currentReview.rating < 1 || currentReview.rating > 5) {
        return 'Rating must be between 1 and 5';
    }
    return null;
};

export const checkMissingReviewUpdateData = (review: Partial<Review>) => {
    if (Object.keys(review).length === 0) {
        return 'No data provided for update';
    }

    if (review.rating !== undefined) {
        if (review.rating < 1 || review.rating > 5) {
            return 'Rating must be between 1 and 5';
        }
    }

    return null;
};

export const sanitizeReviewData = (newReviewData: any): Partial<Review> => {
    const excludedFields: Array<keyof Review> = ['id', 'customerId', 'productId', 'createdAt'];
    const sanitizedData: Partial<Review> = {};

    const productFields: Array<keyof Review> = [
        'content', 'customerId', 'rating', 'updatedAt'
    ];

    for (const key in newReviewData) {
        // Only include fields that are part of the Product interface and not in excluded list
        if (productFields.includes(key as keyof Review) && !excludedFields.includes(key as keyof Review)) {
            sanitizedData[key as keyof Review] = newReviewData[key];
        }
    }

    return sanitizedData;
};
