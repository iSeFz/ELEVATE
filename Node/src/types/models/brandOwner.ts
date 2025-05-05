import { Timestamp } from "firebase-admin/firestore";

export interface BrandOwner {
    id?: string;
    brandId: string; // Denormalized field for authorization
    email: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    username: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;

    password?: string; // Optional for authentication purposes
}
