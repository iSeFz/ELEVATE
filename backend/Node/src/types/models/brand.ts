import { Address, TimestampUnion, Website, websiteDataValidators } from './common.js';
import { SubscriptionPlan } from '../../config/subscriptionPlans.js';

export interface Subscription {
    plan: SubscriptionPlan | string;
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
