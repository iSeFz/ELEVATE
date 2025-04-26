import { Timestamp } from 'firebase-admin/firestore';
import { FirestoreReference } from './common.js';
import { Customer } from './customer.js';

export interface Review {
    id?: string;
    content: string;
    customer: FirestoreReference<Customer>;
    // Denormalized field for authorization
    customerId?: string;
    dateCreated: Timestamp;
    rating: number;
}