import { BrandOwner, brandOwnerDataValidators } from '../../types/models/brandOwner.js';
import { convertToTimestamp } from './common.js';

export const checkMissingBrandOwnerUpdateData = (brandOwner: any) => {
    if (Object.keys(brandOwner).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

export const generateFullyBrandOwnerData = (brandOwner: BrandOwner): BrandOwner => {
    const fullyData: BrandOwner = {
        brandId: brandOwner.brandId ?? "",
        brandName: brandOwner.brandName ?? "",
        email: brandOwner.email ?? "",
        firstName: brandOwner.firstName ?? "",
        lastName: brandOwner.lastName ?? "",
        imageURL: brandOwner.imageURL ?? "",
        username: brandOwner.username ?? "",

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
