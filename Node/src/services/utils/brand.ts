import { Brand } from '../../types/models/brand.js';

export const checkMissingBrandData = (brand: any) => {
    const currentBrand = brand as Brand;
    if (brand == null) {
        return 'Brand data is required';
    }
    if (currentBrand.brandName == null || currentBrand.email == null || 
        currentBrand.industry == null || currentBrand.storyDescription == null) {
        return 'Brand name, email, industry, and story description are required';
    }
    return null;
};

export const checkMissingBrandUpdateData = (brand: any) => {
    if (Object.keys(brand).length === 0) {
        return 'No data provided for update';
    }
    return null;
};