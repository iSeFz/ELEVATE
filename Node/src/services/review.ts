import { admin } from '../config/firebase.js';
import { checkMissingReviewData, checkMissingReviewUpdateData, sanitizeReviewData } from './utils/review.js';
import { Review } from '../types/models/review.js';
import { Timestamp } from 'firebase-admin/firestore';
import * as productService from './product.js';

const firestore = admin.firestore();
const reviewCollection = 'review';

export const getAllReviews = async () => {
    try {
        const snapshot = await firestore.collection(reviewCollection).get();
        const reviews: Review[] = [];
        snapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        return reviews;
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
            return { id: docSnap.id, ...docSnap.data() } as Review;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getReviewsByCustomer = async (customerID: string) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        const customerRef = firestore.collection('customer').doc(customerID);
        const snapshot = await firestore.collection(reviewCollection)
            .where("customer", "==", customerRef)
            .get();

        const reviews: Review[] = [];
        snapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        return reviews;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getReviewsByProduct = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    try {
        const productRef = firestore.collection('product').doc(productID);
        const snapshot = await firestore.collection(reviewCollection)
            .where("product", "==", productRef)
            .get();

        const reviews: Review[] = [];
        snapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        return reviews;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addReview = async (review: Review) => {
    try {
        const missedReviewData = checkMissingReviewData(review);
        if (missedReviewData) {
            throw new Error(missedReviewData);
        }

        const customId = review.id;
        const reviewData: Review = {
            customerId: review.customerId,
            productId: review.productId,
            content: review.content,
            title: review.title,
            rating: review.rating ?? 0,
            createdAt: review.createdAt ?? Timestamp.now(),
            updatedAt: review.updatedAt ?? Timestamp.now(),
        }

        let savedReview;
        if (customId) {
            const docRef = firestore.collection(reviewCollection).doc(customId);
            await docRef.set(reviewData);
            savedReview = { id: customId, ...reviewData };
        } else {
            const docRef = await firestore.collection(reviewCollection).add(reviewData);
            savedReview = { id: docRef.id, ...reviewData };
        }

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

    newReviewData = sanitizeReviewData(newReviewData);

    try {
        const missedUpdateData = checkMissingReviewUpdateData(newReviewData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        // Get the existing review to compare ratings
        const existingReview = await getReview(reviewID);
        if (!existingReview) {
            throw new Error('Review not found');
        }

        const reviewRef = firestore.collection(reviewCollection).doc(reviewID);
        await reviewRef.update(newReviewData);

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

    // Add review ID to product's reviewIds array
    const updatedReviewIds = [...(product.reviewIds || []), review.id!];

    // Calculate new average rating
    const currentTotal = product.averageRating * product.totalReviews;
    const newTotal = currentTotal + review.rating;
    const newCount = product.totalReviews + 1;
    const newAverage = newTotal / newCount;

    // Update product
    await productService.updateProduct(review.productId, {
        reviewIds: updatedReviewIds,
        totalReviews: newCount,
        averageRating: newAverage,
        updatedAt: Timestamp.now()
    });
}

async function updateProductAfterReviewUpdate(existingReview: Review, newRating: number) {
    const product = await productService.getProduct(existingReview.productId);
    if (!product) return;

    // Calculate new average
    const currentTotal = product.averageRating * product.totalReviews;
    const adjustedTotal = currentTotal - existingReview.rating + newRating;
    const newAverage = adjustedTotal / product.totalReviews;

    // Update product
    await productService.updateProduct(existingReview.productId, {
        averageRating: newAverage,
        updatedAt: Timestamp.now()
    });
}

async function updateProductAfterReviewDelete(review: Review) {
    const product = await productService.getProduct(review.productId);
    if (!product) return;

    // Remove review ID from product's reviewIds array
    const updatedReviewIds = product.reviewIds.filter(id => id !== review.id);

    // Calculate new average (handle case where this was the only review)
    let newAverage = 0;
    let newCount = product.totalReviews - 1;

    if (newCount > 0) {
        const currentTotal = product.averageRating * product.totalReviews;
        const adjustedTotal = currentTotal - review.rating;
        newAverage = adjustedTotal / newCount;
    }

    // Update product
    await productService.updateProduct(review.productId, {
        reviewIds: updatedReviewIds,
        totalReviews: newCount,
        averageRating: newAverage,
        updatedAt: Timestamp.now()
    });
}