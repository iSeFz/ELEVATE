import { Timestamp } from "firebase-admin/firestore";
import { commonDataValidators, TimestampUnion } from "./common.js";

export interface BrandOwner {
    id?: string;
    brandId: string; // Denormalized field for authorization
    email: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    username: string;
    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;

    password?: string; // Optional for authentication purposes
}


export const brandOwnerDataValidators = (value: BrandOwner): boolean => {
    const validators: Record<keyof BrandOwner, (value: any) => boolean> = {
        id: (v) => typeof v === 'string',
        brandId: (v) => typeof v === 'string',
        email: (v) => typeof v === 'string',
        firstName: (v) => typeof v === 'string',
        lastName: (v) => typeof v === 'string',
        imageURL: (v) => typeof v === 'string',
        username: (v) => typeof v === 'string',
        password: (v) => typeof v === 'string',
        createdAt: (v) => v instanceof Timestamp,
        updatedAt: (v) => v instanceof Timestamp
    }
    return commonDataValidators<BrandOwner>(value, validators);
}
