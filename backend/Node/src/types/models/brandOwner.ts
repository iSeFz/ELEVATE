import { TimestampUnion } from "./common.js";

export interface BrandOwner {
    id?: string;
    brandId: string; // Denormalized field for authorization
    brandName: string;
    email: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    username: string;
    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;

    password?: string; // Optional for authentication purposes
}
