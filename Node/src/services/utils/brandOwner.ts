import { Timestamp } from 'firebase-admin/firestore';
import { BrandOwner } from '../../types/models/brandOwner.js';

export const checkMissingBrandOwnerData = (brandOwner: any) => {
    const currentBrandOwner = brandOwner as BrandOwner;
    if (currentBrandOwner.email == null || currentBrandOwner.firstName == null ||
        currentBrandOwner.lastName == null || currentBrandOwner.username == null ||
        currentBrandOwner.password == null) {
        return 'Email, first name, last name, username, and password are required';
    }
    return null;
};

export const checkMissingBrandOwnerUpdateData = (brandOwner: any) => {
    if (Object.keys(brandOwner).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

export const sanitizeBrandOwnerData = (newBrandOwnerData: any): Partial<BrandOwner> => {
    const excludedFields = ['id', 'brandId', 'email', 'createdAt'];
    const sanitizedData: Partial<BrandOwner> = {};

    const productFields: Array<keyof BrandOwner> = [
        "firstName", "lastName", "imageURL", "username", "updatedAt"
    ];

    for (const key in newBrandOwnerData) {
        // Only include fields that are part of the Product interface and not in excluded list
        if (productFields.includes(key as keyof BrandOwner) && !excludedFields.includes(key)) {
            sanitizedData[key as keyof BrandOwner] = newBrandOwnerData[key];
        }
    }

    return sanitizedData;
};

export const generateEmptyBrandOwnerData = (): BrandOwner => ({
    id: "",
    brandId: "",
    email: "",
    firstName: "",
    lastName: "",
    imageURL: "",
    username: "",

    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),

    password: "", // Optional for authentication purposes
});
