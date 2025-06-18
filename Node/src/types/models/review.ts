import { TimestampUnion } from "./common.js";

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
