import { Request, Response, NextFunction } from 'express';
import { BrandOwner, brandOwnerDataValidators } from '../../types/models/brandOwner.js';
import { Brand, brandDataValidators } from '../../types/models/brand.js';
import { validateObjectStructure } from './common.js';

/**
 * Required Parameters:
 * - id: String - ID of the cart item to remove
 */
export const validateDeleteBrandOwner = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Brand owner ID is required'
        });
    }

    next();
};


const expecteSignupData: { brand: Partial<Brand> } & Partial<BrandOwner> = {
    email: "String",
    password: "String",
    firstName: "String",
    lastName: "String",
    brand: {
        brandName: "String",
        industry: "String",
        storyDescription: "String",
        email: "String"
    }
};
/**
 * Required Parameters:
 * - brandOwner: BrandOwner - Brand owner data
 *   - brandName: String - Name of the brand
 *   - email: String - Email of the brand
 *   - industry: String - Industry of the brand
 *   - storyDescription: String - Story description of the brand
 *  
 * - email: String - Email of the brand owner
 * - password: String - Password of the brand owner
 * - firstName: String - First name of the brand owner
 * - lastName: String - Last name of the brand owner
 */
export const validateSignupBrandOwner = (req: Request, res: Response, next: NextFunction) => {
    // Check if the overall structure matches
    if (!validateObjectStructure(req.body, expecteSignupData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expecteSignupData
        });
    }
    let { brand, ...brandOwner }: { brand: Brand } & BrandOwner = req.body;

    const isBrandValid = brandDataValidators(brand);
    const isBrandOwnerValid = brandOwnerDataValidators(brandOwner);
    if (!isBrandValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid brand data types.',
            expectedFormat: expecteSignupData,
        });
    }
    if (!isBrandOwnerValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid brand owner data types.',
            expectedFormat: expecteSignupData,
        });
    }

    next();
}


const expectedUpdateBrandOwnerData: Partial<BrandOwner> = {
    brandId: "String",
    firstName: "String",
    lastName: "String",
    imageURL: "String",
    username: "String",
}
/**
 * Required Parameters:
 * - id: String - ID of the brand owner to update
 * 
 * Data to update:
 *   - username: String - Email of the brand owner
 *   - imageURL: String - Password of the brand owner
 *   - firstName: String - First name of the brand owner
 *   - lastName: String - Last name of the brand owner
 */
export const validateUpdateBrandOwner = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const brandOwner = req.body as BrandOwner;
    // Check if the overall structure matches
    if (!validateObjectStructure(brandOwner, expectedUpdateBrandOwnerData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedUpdateBrandOwnerData
        });
    }

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Brand owner ID is required'
        });
    }

    // Check if the brand owner data is valid
    const isBrandOwnerValid = brandOwnerDataValidators(brandOwner);
    if (!isBrandOwnerValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid brand owner data types.',
            expectedFormat: expectedUpdateBrandOwnerData
        });
    }

    next();
}
