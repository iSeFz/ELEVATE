import { Timestamp } from 'firebase-admin/firestore';
import { FirestoreReference } from './common.js';
import { Brand } from './brand.js';
import { Review } from './review.js';
import { ProductVariant } from './productVariant.js';

export interface Product {
    id?: string;
    averageRating: number;
    brand: FirestoreReference<Brand>;
    category: string;
    dateCreated: Timestamp;
    department: string[];
    description: string;
    material: string;
    name: string;
    reviews: FirestoreReference<Review>[];
    stock: number;
    totalReviews: number;
    variants: FirestoreReference<ProductVariant>[];
}