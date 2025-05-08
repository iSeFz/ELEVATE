import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

export interface Address {
    building: number;
    city: string;
    postalCode: number;
    street: string;
}

export interface Website {
    type: string;
    url: string;
}

export type TimestampUnion = Timestamp | string | number;

// For references to other collections
export type FirestoreReference<T> = DocumentReference<T>;

export const commonDataValidators = <T>(value: T,
    validators: Record<keyof T, (value: any) => boolean>): boolean => {
    let result = typeof value === 'object' && value !== null;
    for (const key in value) {
        const serachedKey = key as keyof T;
        if (!validators[serachedKey]) return false;
        result = result && validators[serachedKey](value[serachedKey]);
    }
    return result;
}

export const addressDataValidators = (value: Address): boolean => {
    const validators: Record<keyof Address, (value: any) => boolean> = {
        building: (v: Address['building']) => typeof v === 'number',
        city: (v: Address['city']) => typeof v === 'string',
        postalCode: (v: Address['postalCode']) => typeof v === 'number',
        street: (v: Address['street']) => typeof v === 'string',
    }
    return commonDataValidators<Address>(value, validators);
}

export const websiteDataValidators = (value: Website): boolean => {
    const validators: Record<keyof Website, (value: any) => boolean> = {
        type: (v: Website['type']) => typeof v === 'string',
        url: (v: Website['url']) => typeof v === 'string',
    }
    return commonDataValidators<Website>(value, validators);
}
