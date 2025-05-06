import { Timestamp } from 'firebase-admin/firestore';

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
    // Most helpful or recent reviews for quick display
    reviewIds?: string[]; // IDs of featured reviews
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

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
