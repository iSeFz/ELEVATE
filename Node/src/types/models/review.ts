import { Timestamp } from "firebase-admin/firestore";
import { commonDataValidators, TimestampUnion } from "./common.js";

export interface Review {
    id?: string;
    customerId: string;
    productId: string;

    title: string;
    content: string;
    rating: number;

    // Denormalize customer data for quick access
    customerFirstName: string;
    customerLastName: string;
    customerImageURL: string;

    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;
}

export const reviewDataValidators = (value: Review): boolean => {
    const validators: Record<keyof Review, (value: any) => boolean> = {
        id: (v: Review['id']) => typeof v === 'string' || v === undefined,
        customerId: (v: Review['customerId']) => typeof v === 'string',
        productId: (v: Review['productId']) => typeof v === 'string',

        title: (v: Review['title']) => typeof v === 'string',
        content: (v: Review['content']) => typeof v === 'string',
        rating: (v: Review['rating']) => typeof v === 'number' && v >= 1 && v <= 5 && Number.isInteger(v),

        customerFirstName: (v: Review['customerFirstName']) => typeof v === 'string' || v === undefined,
        customerLastName: (v: Review['customerLastName']) => typeof v === 'string' || v === undefined,
        customerImageURL: (v: Review['customerImageURL']) => typeof v === 'string' || v === undefined,

        createdAt: (v: Review['createdAt']) => v instanceof Timestamp,
        updatedAt: (v: Review['updatedAt']) => v instanceof Timestamp,
    }
    return commonDataValidators<Review>(value, validators);
}
