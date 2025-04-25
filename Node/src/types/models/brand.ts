import { Timestamp } from 'firebase-admin/firestore';
import { Address, FirestoreReference, Website } from './common.js';
import { BrandOwner } from './brandOwner.js';

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
    brandOwner: FirestoreReference<BrandOwner>;
    email: string;
    imageURL: string;
    industry: string;
    phoneNumbers: string[];
    rating: number;
    storyDescription: string;
    subscription: Subscription;
    websites: Website[];
}