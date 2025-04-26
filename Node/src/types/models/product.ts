import { Timestamp } from 'firebase-admin/firestore';
import { FirestoreReference } from './common.js';
import { Brand } from './brand.js';
import { Review } from './review.js';
import { ProductVariant } from './productVariant.js';

export interface Product {
    id?: string;
    averageRating: number;
    
    // Core business relationship - keep the reference
    brand: FirestoreReference<Brand>;
    
    // Denormalized fields for authorization and filtering
    brandId: string;
    brandOwnerId: string;
    
    category: string;
    dateCreated: Timestamp;
    department: string[];
    description: string;
    material: string;
    name: string;
    
    // Collection of references - important for business logic
    reviews: FirestoreReference<Review>[];
    // Also add denormalized array of IDs for simpler queries
    reviewIds?: string[];
    
    stock: number;
    totalReviews: number;
    
    // Collection of references - important for business logic
    variants: FirestoreReference<ProductVariant>[];
    // Also add denormalized array of IDs for simpler queries
    variantIds?: string[];
}