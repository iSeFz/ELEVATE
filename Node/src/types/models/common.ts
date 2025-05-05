import { DocumentReference } from 'firebase-admin/firestore';

export interface Address {
    building?: number;
    city?: string;
    postalCode?: number;
    street?: string;
}

export interface Website {
    type: string;
    url: string;
}

// For references to other collections
export type FirestoreReference<T> = DocumentReference<T>;
