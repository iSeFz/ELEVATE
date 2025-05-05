import { Timestamp } from 'firebase-admin/firestore';
import { Address, Website } from './common.js';

export interface Subscription {
    plan: string;
    price: number;
    startDate: Timestamp;
    endDate: Timestamp;
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
    productIds: string[]; // Denormalized for easier queries

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
