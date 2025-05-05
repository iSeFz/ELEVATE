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

export interface Product {
    id?: string;
    averageRating: number;
    brandId: string;
    brandOwnerId: string;
    category: string;
    department: string[];
    description: string;
    material: string;
    name: string;
    reviewIds: string[];
    totalReviews: number;
    variants: ProductVariant[];

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
