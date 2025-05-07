import { BrandOwner, brandOwnerDataValidators } from '../../types/models/brandOwner.js';
import { convertToTimestamp } from './common.js';

export const checkRequiredBrandOwnerData = (brandOwner: any) => {
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
    const excludedFields = ['id', 'email', 'createdAt'];
    const sanitizedData: Partial<BrandOwner> = {};

    const productFields: Array<keyof BrandOwner> = [
        "brandId", "firstName", "lastName", "imageURL", "username", "updatedAt"
    ];

    for (const key in newBrandOwnerData) {
        // Only include fields that are part of the Product interface and not in excluded list
        if (productFields.includes(key as keyof BrandOwner) && !excludedFields.includes(key)) {
            sanitizedData[key as keyof BrandOwner] = newBrandOwnerData[key];
        }
    }

    return sanitizedData;
};

export const generateFullyBrandOwnerData = (brandOwner: BrandOwner): BrandOwner => {
    const fullyData: BrandOwner = {
        id: brandOwner.id ?? "",
        brandId: brandOwner.brandId ?? "",
        email: brandOwner.email ?? "",
        firstName: brandOwner.firstName ?? "",
        lastName: brandOwner.lastName ?? "",
        imageURL: brandOwner.imageURL ?? "",
        username: brandOwner.username ?? "",

        createdAt: convertToTimestamp(brandOwner.createdAt),
        updatedAt: convertToTimestamp(brandOwner.updatedAt),

        password: brandOwner.password ?? "", // Optional for authentication purposes
    };

    if (!brandOwnerDataValidators(fullyData)) {
        throw new Error('Invalid brand owner data, check types and formats');
    }

    return fullyData;
}
