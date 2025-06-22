import { TimestampUnion } from "./common.js";
import { SubscriptionPlan } from '../../config/subscriptionPlans.js';

export interface ProductVariant {
    id?: string;
    colors: string[];
    discount: number;
    images: string[];
    price: number;
    size: string;
    stock: number;
}

export interface ProductReviewSummary {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    };
}

export interface Product {
    id?: string;
    brandId: string;
    brandOwnerId: string;
    brandName: string;
    category: string;
    department: string[];
    description: string;
    material: string;
    name: string;
    variants: ProductVariant[];
    reviewSummary: ProductReviewSummary;
    wishlistCount: number; // Number of times this product has been added to wishlists, used for popularity ranking
    brandSubscriptionPlan: SubscriptionPlan | string; // Helps with filtering products by subscription plan

    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;
}

export interface ProductAssociation {
    id?: string;
    productId: string; // Lexicographically smaller product ID
    associatedProductId: string; // Lexicographically larger product ID
    coOccurrenceCount: number; // How many times bought together
    confidence: number; // Percentage confidence score
    lastUpdated: TimestampUnion;
}

export interface ProductRecommendation {
    product: any; // Product object
    score: number; // Co-occurrence count
    confidence: number; // Confidence percentage
}
