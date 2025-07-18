import { Review } from '../../types/models/review.js';
import { convertToTimestamp } from './common.js';

const emptyReview: Review = {
    customerId: "",
    productId: "",

    title: "",
    content: "",
    rating: 0,

    customerFirstName: "",
    customerLastName: "",
    customerImageURL: "",

    createdAt: "",
    updatedAt: "",
}

export const generateFullyReviewData = (review: Review): Review => {
    const fullyData: Review = {
        customerId: review.customerId ?? emptyReview.customerId,
        productId: review.productId ?? emptyReview.productId,

        title: review.title ?? emptyReview.title,
        content: review.content ?? emptyReview.content,
        rating: review.rating ?? emptyReview.rating,

        customerFirstName: review.customerFirstName ?? emptyReview.customerFirstName,
        customerLastName: review.customerLastName ?? emptyReview.customerLastName,
        customerImageURL: review.customerImageURL ?? emptyReview.customerImageURL,

        createdAt: convertToTimestamp(review.createdAt),
        updatedAt: convertToTimestamp(review.updatedAt),
    };
    if (review.id) {
        fullyData.id = review.id;
    }

    return fullyData;
}
