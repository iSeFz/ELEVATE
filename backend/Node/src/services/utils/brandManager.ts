import { BrandManager } from '../../types/models/brandManager.js';
import { convertToTimestamp } from './common.js';

export const checkMissingBrandManagerUpdateData = (brandManager: any) => {
    if (Object.keys(brandManager).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

const emptyBrandManager: BrandManager = {
    brandOwnerId: "",
    brandId: "",
    brandName: "",
    email: "",
    firstName: "",
    lastName: "",
    imageURL: "",
    username: "",
    createdAt: "",
    updatedAt: "",
    password: "", // Optional for authentication purposes
}

export const generateFullyBrandManagerData = (brandManager: BrandManager): BrandManager => {
    const fullyData: BrandManager = {
        brandOwnerId: brandManager.brandOwnerId ?? emptyBrandManager.brandOwnerId,
        brandId: brandManager.brandId ?? emptyBrandManager.brandId,
        brandName: brandManager.brandName ?? emptyBrandManager.brandName,
        email: brandManager.email ?? emptyBrandManager.email,
        firstName: brandManager.firstName ?? emptyBrandManager.firstName,
        lastName: brandManager.lastName ?? emptyBrandManager.lastName,
        imageURL: brandManager.imageURL ?? emptyBrandManager.imageURL,
        username: brandManager.username ?? emptyBrandManager.username,

        createdAt: convertToTimestamp(brandManager.createdAt),
        updatedAt: convertToTimestamp(brandManager.updatedAt),

        password: brandManager.password ?? "", // Optional for authentication purposes
    };
    if (brandManager.id) {
        fullyData.id = brandManager.id;
    }

    return fullyData;
}
