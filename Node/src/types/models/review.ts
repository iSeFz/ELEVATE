import { Timestamp } from 'firebase-admin/firestore';

export interface Review {
    id?: string;
    customerId: string;
    productId: string;

    title: string;
    content: string;
    rating: number;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
