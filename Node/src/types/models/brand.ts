import { Timestamp } from 'firebase-admin/firestore';
import { Address, addressDataValidators, commonDataValidators, TimestampUnion, Website, websiteDataValidators } from './common.js';
import { SubscriptionPlan } from '../../config/subscriptionPlans.js';

export interface Subscription {
    plan: SubscriptionPlan;
    price: number;
    startDate: TimestampUnion;
    endDate: TimestampUnion;
}

export interface Brand {
    id?: string;
    addresses: Address[];
    brandName: string;
    brandOwnerId: string; // Denormalized field for authorization
    email: string;
    imageURL: string;
    industry: string;
    phoneNumbers: string[];
    rating: number;
    storyDescription: string;
    subscription: Subscription;
    websites: Website[];
    productCount: number; // Denormalized count of products for quota checks

    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;
}

export const subscriptionDataValidators = (value: Subscription): boolean => {
    const validators: Record<keyof Subscription, (value: any) => boolean> = {
        plan: (v: Subscription['plan']) => typeof v === 'number' && Object.values(SubscriptionPlan).includes(v),
        price: (v: Subscription['price']) => typeof v === 'number',
        startDate: (v: Subscription['startDate']) => v instanceof Timestamp,
        endDate: (v: Subscription['endDate']) => v instanceof Timestamp,
    }
    return commonDataValidators<Subscription>(value, validators);
}


export const brandDataValidators = (value: Brand): boolean => {
    const validators: Record<keyof Brand, (value: any) => boolean> = {
        id: (v: Brand['id']) => typeof v === 'string' || v === undefined,
    
        addresses: (v: Brand['addresses']) => Array.isArray(v) && v.every(addr => addressDataValidators(addr)),
    
        brandName: (v: Brand['brandName']) => typeof v === 'string',
        brandOwnerId: (v: Brand['brandOwnerId']) => typeof v === 'string',
        email: (v: Brand['email']) => typeof v === 'string',
        imageURL: (v: Brand['imageURL']) => typeof v === 'string',
        industry: (v: Brand['industry']) => typeof v === 'string',
    
        phoneNumbers: (v: Brand['phoneNumbers']) => Array.isArray(v) && v.every(ph => typeof ph === 'string'),
    
        rating: (v: Brand['rating']) => typeof v === 'number',
        storyDescription: (v: Brand['storyDescription']) => typeof v === 'string',
    
        subscription: (v: Brand['subscription']) => subscriptionDataValidators(v),
    
        websites: (v: Brand['websites']) => Array.isArray(v) && v.every(site => websiteDataValidators(site)),
    
        productCount: (v: Brand['productCount']) => typeof v === 'number',
    
        createdAt: (v: Brand['createdAt']) => v instanceof Timestamp,
        updatedAt: (v: Brand['updatedAt']) => v instanceof Timestamp,
    }
    return commonDataValidators<Brand>(value, validators);
}
