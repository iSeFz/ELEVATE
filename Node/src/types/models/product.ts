import { Timestamp } from "firebase-admin/firestore";
import { commonDataValidators, TimestampUnion } from "./common.js";
import { SubscriptionPlan } from "./brand.js";

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
    brandSubscriptionPlan: SubscriptionPlan;

    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;
}

export const productVariantDataValidators = (value: ProductVariant): boolean => {
    const validators: Record<keyof ProductVariant, (value: any) => boolean> = {
        id: (v: ProductVariant['id']) => typeof v === 'string' || v === undefined,
        colors: (v: ProductVariant['colors']) => Array.isArray(v) && v.every(color => typeof color === 'string'),
        discount: (v: ProductVariant['discount']) => typeof v === 'number',
        images: (v: ProductVariant['images']) => Array.isArray(v) && v.every(image => typeof image === 'string'),
        price: (v: ProductVariant['price']) => typeof v === 'number',
        size: (v: ProductVariant['size']) => typeof v === 'string',
        stock: (v: ProductVariant['stock']) => typeof v === 'number',
    }
    return commonDataValidators<ProductVariant>(value, validators);
}

export const productReviewSummaryDataValidators = (value: ProductReviewSummary): boolean => {
    const validators: Record<keyof ProductReviewSummary, (value: any) => boolean> = {
        averageRating: (v: ProductReviewSummary['averageRating']) => typeof v === 'number',
        totalReviews: (v: ProductReviewSummary['totalReviews']) => typeof v === 'number',
        ratingDistribution: (v: ProductReviewSummary['ratingDistribution']) => {
            return typeof v === 'object' && Object.keys(v).length === 5 && Object.values(v).every(val => typeof val === 'number');
        },
    }
    return commonDataValidators<ProductReviewSummary>(value, validators);
}

export const productDataValidators = (value: Product): boolean => {
    const validators: Record<keyof Product, (value: any) => boolean> = {
        id: (v: Product['id']) => typeof v === 'string' || v === undefined,
        brandId: (v: Product['brandId']) => typeof v === 'string',
        brandOwnerId: (v: Product['brandOwnerId']) => typeof v === 'string',
        brandName: (v: Product['brandName']) => typeof v === 'string',
        category: (v: Product['category']) => typeof v === 'string',
        department: (v: Product['department']) => Array.isArray(v) && v.every(dep => typeof dep === 'string'),
        description: (v: Product['description']) => typeof v === 'string',
        material: (v: Product['material']) => typeof v === 'string',
        name: (v: Product['name']) => typeof v === 'string',
        variants: (v: Product['variants']) => Array.isArray(v) && v.every(variant => productVariantDataValidators(variant)),
        reviewSummary: (v: Product['reviewSummary']) => productReviewSummaryDataValidators(v),
        brandSubscriptionPlan: (v: Product['brandSubscriptionPlan']) => Object.values(SubscriptionPlan).includes(v),
        createdAt: (v: Product['createdAt']) => v instanceof Timestamp,
        updatedAt: (v: Product['updatedAt']) => v instanceof Timestamp,
    }
    return commonDataValidators<Product>(value, validators);
}
