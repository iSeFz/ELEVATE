import { Review, reviewDataValidators } from '../../types/models/review.js';
import { convertToTimestamp } from './common.js';

export const generateFullyReviewData = (review: Review): Review => {
    const fullyData: Review = {
        customerId: review.customerId ?? "",
        productId: review.productId ?? "",

        title: review.title ?? "",
        content: review.content ?? "",
        rating: review.rating ?? 0,

        createdAt: convertToTimestamp(review.createdAt),
        updatedAt: convertToTimestamp(review.updatedAt),
    };
    if (review.id) {
        fullyData.id = review.id;
    }

    if (!reviewDataValidators(fullyData)) {
        throw new Error('Invalid review data, check types and formats');
    }

    return fullyData;
}
