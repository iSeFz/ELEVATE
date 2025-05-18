import { BrandOwner, brandOwnerDataValidators } from '../../types/models/brandOwner.js';
import { convertToTimestamp } from './common.js';

export const checkMissingBrandOwnerUpdateData = (brandOwner: any) => {
    if (Object.keys(brandOwner).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

const emptyBrandOwner: BrandOwner = {
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

export const generateFullyBrandOwnerData = (brandOwner: BrandOwner): BrandOwner => {
    const fullyData: BrandOwner = {
        brandId: brandOwner.brandId ?? emptyBrandOwner.brandId,
        brandName: brandOwner.brandName ?? emptyBrandOwner.brandName,
        email: brandOwner.email ?? emptyBrandOwner.email,
        firstName: brandOwner.firstName ?? emptyBrandOwner.firstName,
        lastName: brandOwner.lastName ?? emptyBrandOwner.lastName,
        imageURL: brandOwner.imageURL ?? emptyBrandOwner.imageURL,
        username: brandOwner.username ?? emptyBrandOwner.username,

        createdAt: convertToTimestamp(brandOwner.createdAt),
        updatedAt: convertToTimestamp(brandOwner.updatedAt),

        password: brandOwner.password ?? "", // Optional for authentication purposes
    };
    if (brandOwner.id) {
        fullyData.id = brandOwner.id;
    }

    if (!brandOwnerDataValidators(fullyData)) {
        throw new Error('Invalid brand owner data, check types and formats');
    }

    return fullyData;
}
