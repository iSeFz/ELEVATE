import { admin } from '../config/firebase.js';
import { generateFullyReviewData } from './utils/review.js';
import { Review } from '../types/models/review.js';
import { Timestamp } from 'firebase-admin/firestore';
import * as productService from './product.js';

const firestore = admin.firestore();
const reviewCollection = 'review';

export const getAllReviewsOfProduct = async (productId: string, page = 1) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
        // Ensure the product exists
        const productData = await productService.getProduct(productId);
        if (!productData) {
            throw new Error('Product not found');
        }

        // Query reviews by productId, ordered by createdAt (latest first)
        const snapshot = await firestore.collection(reviewCollection)
            .where('productId', '==', productId)
            .orderBy('createdAt', 'desc')
            .offset(offset)
            .limit(limit)
            .get();

        const reviews = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));

        const hasNextPage = reviews.length === limit;

        return {
            reviews,
            pagination: {
                page,
                limit,
                hasNextPage
            }
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getReview = async (reviewID: string) => {
    if (!reviewID) {
        throw new Error('Please provide a review ID');
    }
    try {
        const docRef = firestore.collection(reviewCollection).doc(reviewID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { ...docSnap.data(), id: docSnap.id } as Review;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addReview = async (review: Review) => {
    try {
        const reviewData = generateFullyReviewData(review);

        let savedReview;
        const docRef = await firestore.collection(reviewCollection).add(reviewData);
        savedReview = { ...reviewData, id: docRef.id };

        // Update product's review data
        await updateProductAfterReviewAdd(savedReview);

        return savedReview;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateReview = async (reviewID: string, newReviewData: Partial<Review>) => {
    if (!reviewID) {
        throw new Error('Please provide a review ID');
    }

    try {
        // Get the existing review to compare ratings
        const existingReview = await getReview(reviewID);
        if (!existingReview) {
            throw new Error('Review not found');
        }

        // Merge existing review with new data to create a complete review object
        const updatedReview = {
            ...existingReview,
            ...newReviewData,
            updatedAt: Timestamp.now()
        };

        // Validate and convert the merged data
        const validatedReviewData = generateFullyReviewData(updatedReview as Review);

        // Update the review
        const reviewRef = firestore.collection(reviewCollection).doc(reviewID);
        await reviewRef.update(validatedReviewData as Partial<Review>);

        // If rating changed, update product's average rating
        if (newReviewData.rating !== undefined && newReviewData.rating !== existingReview.rating) {
            await updateProductAfterReviewUpdate(existingReview, newReviewData.rating);
        }

        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteReview = async (reviewID: string) => {
    if (!reviewID) {
        throw new Error('Please provide a review ID');
    }
    try {
        // Get the review before deleting
        const existingReview = await getReview(reviewID);
        if (!existingReview) {
            throw new Error('Review not found');
        }

        // Delete the review
        const reviewRef = firestore.collection(reviewCollection).doc(reviewID);
        await reviewRef.delete();

        // Update the product
        await updateProductAfterReviewDelete(existingReview);

        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Helper functions for product updates

async function updateProductAfterReviewAdd(review: Review) {
    const product = await productService.getProduct(review.productId);
    if (!product) return;

    // Calculate new average rating
    const currentTotal = product.reviewSummary.averageRating * product.reviewSummary.totalReviews;
    const newTotal = currentTotal + review.rating;
    const newCount = product.reviewSummary.totalReviews + 1;
    const newAverage = newTotal / newCount;

    // Update rating distribution
    const ratingDistribution = { ...product.reviewSummary.ratingDistribution };
    const ratingKey = review.rating.toString() as keyof typeof ratingDistribution;
    ratingDistribution[ratingKey] = (ratingDistribution[ratingKey] || 0) + 1;

    await productService.updateProduct(review.productId, {
        reviewSummary: {
            ...product.reviewSummary,
            totalReviews: newCount,
            averageRating: newAverage,
            ratingDistribution
        },
        updatedAt: Timestamp.now()
    });
}

async function updateProductAfterReviewUpdate(existingReview: Review, newRating: number) {
    const product = await productService.getProduct(existingReview.productId);
    if (!product) return;

    // Calculate new average
    const currentTotal = product.reviewSummary.averageRating * product.reviewSummary.totalReviews;
    const adjustedTotal = currentTotal - existingReview.rating + newRating;
    const newAverage = adjustedTotal / product.reviewSummary.totalReviews;

    // Update rating distribution
    const ratingDistribution = { ...product.reviewSummary.ratingDistribution };
    const oldRatingKey = existingReview.rating.toString() as keyof typeof ratingDistribution;
    const newRatingKey = newRating.toString() as keyof typeof ratingDistribution;

    // Decrease count for old rating
    ratingDistribution[oldRatingKey] = Math.max(0, (ratingDistribution[oldRatingKey] || 0) - 1);
    // Increase count for new rating
    ratingDistribution[newRatingKey] = (ratingDistribution[newRatingKey] || 0) + 1;

    // Update product
    await productService.updateProduct(existingReview.productId, {
        reviewSummary: {
            ...product.reviewSummary,
            averageRating: newAverage,
            ratingDistribution
        },
        updatedAt: Timestamp.now()
    });
}

async function updateProductAfterReviewDelete(review: Review) {
    const product = await productService.getProduct(review.productId);
    if (!product) return;

    // Calculate new average (handle case where this was the only review)
    let newAverage = 0;
    let newCount = product.reviewSummary.totalReviews - 1;

    if (newCount > 0) {
        const currentTotal = product.reviewSummary.averageRating * product.reviewSummary.totalReviews;
        const adjustedTotal = currentTotal - review.rating;
        newAverage = adjustedTotal / newCount;
    }

    // Update rating distribution
    const ratingDistribution = { ...product.reviewSummary.ratingDistribution };
    const ratingKey = review.rating.toString() as keyof typeof ratingDistribution;
    ratingDistribution[ratingKey] = Math.max(0, (ratingDistribution[ratingKey] || 0) - 1);

    await productService.updateProduct(review.productId, {
        reviewSummary: {
            ...product.reviewSummary,
            totalReviews: newCount,
            averageRating: newAverage,
            ratingDistribution
        },
        updatedAt: Timestamp.now()
    });
}
