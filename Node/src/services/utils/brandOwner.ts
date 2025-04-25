import { BrandOwner } from '../../types/models/brandOwner.js';

export const checkMissingBrandOwnerData = (brandOwner: any) => {
    const currentBrandOwner = brandOwner as BrandOwner;
    if (currentBrandOwner.email == null || currentBrandOwner.firstName == null || 
        currentBrandOwner.lastName == null || currentBrandOwner.username == null) {
        return 'Email, first name, last name, and username are required';
    }
    return null;
};

export const checkMissingBrandOwnerUpdateData = (brandOwner: any) => {
    if (Object.keys(brandOwner).length === 0) {
        return 'No data provided for update';
    }
    return null;
};