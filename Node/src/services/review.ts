import { admin } from '../config/firebase.js';
import { checkMissingReviewData, checkMissingReviewUpdateData } from './utils/review.js';
import { Review } from '../types/models/review.js';
import { Timestamp } from 'firebase-admin/firestore';

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
        const { id, ...reviewData } = review;
        
        // Set dateCreated if not provided
        if (!reviewData.dateCreated) reviewData.dateCreated = Timestamp.now();
        
        // Add denormalized customerId if customer reference exists
        if (reviewData.customer && !reviewData.customerId) {
            reviewData.customerId = reviewData.customer.id;
        }
        
        if (customId) {
            const docRef = firestore.collection(reviewCollection).doc(customId);
            await docRef.set(reviewData);
            return { id: customId, ...reviewData };
        } else {
            const docRef = await firestore.collection(reviewCollection).add(reviewData);
            return { id: docRef.id, ...reviewData };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateReview = async (reviewID: string, newReviewData: Partial<Review>) => {
    if (!reviewID) {
        throw new Error('Please provide a review ID');
    }
    
    try {
        const missedUpdateData = checkMissingReviewUpdateData(newReviewData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        // Validate rating if it's being updated
        if (newReviewData.rating !== undefined) {
            if (newReviewData.rating < 1 || newReviewData.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
        }

        const reviewRef = firestore.collection(reviewCollection).doc(reviewID);
        await reviewRef.update(newReviewData);
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
        const reviewRef = firestore.collection(reviewCollection).doc(reviewID);
        await reviewRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};