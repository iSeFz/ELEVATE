import { Request, Response, NextFunction } from 'express';
import { Brand, brandDataValidators } from '../../types/models/brand.js';
import { validateObjectStructure } from './common.js';

const expectedUpdateBrandData: Partial<Brand> = {
    addresses: [{
        postalCode: 123456,
        building: 123,
        city: "String",
        street: "String",
    }],
    brandName: "String",
    email: "String",
    imageURL: "String",
    industry: "String",
    phoneNumbers: ["String"],
    rating: 0,
    storyDescription: "String",
    websites: [{
        url: "String",
        type: "String",
    }],
}
/**
 * Required Parameters:
 * - id: String - ID of the brand owner to update
 * 
 * Data to update:
 * - addresses: Array of Address objects
 *   - postalCode: Number
 *   - building: Number
 *   - city: String
 *   - street: String
 * - brandName: String
 * - email: String
 * - imageURL: String
 * - industry: String
 * - phoneNumbers: Array of Strings
 * - rating: Number
 * - storyDescription: String
 * - subscription: Subscription object
 * - websites: Array of Website objects
 *   - url: String
 *   - type: String
 */
export const validateUpdateBrand = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const brand = req.body as Brand;
    // Check if the overall structure matches
    if (!validateObjectStructure(brand, expectedUpdateBrandData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedUpdateBrandData
        });
    }

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Brand ID is required'
        });
    }

    const isBrandOwnerValid = brandDataValidators(brand);
    if (!isBrandOwnerValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid brand data types.',
            expectedFormat: expectedUpdateBrandData
        });
    }

    next();
}
