import { Timestamp } from 'firebase-admin/firestore';
import { FirestoreReference } from './common.js';
import { Brand } from './brand.js';
import { Review } from './review.js';

// Embed the ProductVariant directly in the Product type
export interface ProductVariant {
    id?: string;
    colors: string[];
    discount: number;
    images: string[];
    price: number;
    size: string;
    stock: number;
}

export interface Product {
    id?: string;
    averageRating: number;
    
    // Denormalized fields for authorization and filtering
    brandId: string;
    brandOwnerId: string;
    
    category: string;
    dateCreated: Timestamp;
    department: string[];
    description: string;
    material: string;
    name: string;
    
    // Denormalized array of IDs for simpler queries
    reviewIds?: string[];
    
    totalReviews: number;
    
    // Directly embed variants as an array
    variants: ProductVariant[];
}