import { Review, reviewDataValidators } from '../../types/models/review.js';
import { convertToTimestamp } from './common.js';

export const checkMissingReviewData = (review: any) => {
    const currentReview = review as Review;
    if (currentReview.title == null || currentReview.content == null ||
        currentReview.customerId == null /* Obtained from token */ || currentReview.productId == null
        || currentReview.rating == null) {
        return 'Review title, content, product id, and rating are required';
    }
    if (currentReview.rating < 1 || currentReview.rating > 5) {
        return 'Rating must be between 1 and 5';
    }
    return null;
};

export const sanitizeReviewData = (newReviewData: any): Partial<Review> => {
    const excludedFields: Array<keyof Review> = ['id', 'customerId', 'productId', 'createdAt'];
    const sanitizedData: Partial<Review> = {};

    const productFields: Array<keyof Review> = [
        'content', 'title', 'rating', 'updatedAt'
    ];

    for (const key in newReviewData) {
        // Only include fields that are part of the Product interface and not in excluded list
        if (productFields.includes(key as keyof Review) && !excludedFields.includes(key as keyof Review)) {
            sanitizedData[key as keyof Review] = newReviewData[key];
        }
    }

    return sanitizedData;
};

export const generateFullyReviewData = (review: Review): Review => {
    const fullyData: Review = {
        id: review.id ?? "",
        customerId: review.customerId ?? "",
        productId: review.productId ?? "",

        title: review.title ?? "",
        content: review.content ?? "",
        rating: review.rating ?? 0,

        createdAt: convertToTimestamp(review.createdAt),
        updatedAt: convertToTimestamp(review.updatedAt),
    };

    if (!reviewDataValidators(fullyData)) {
        throw new Error('Invalid review data, check types and formats');
    }

    return fullyData;
}
