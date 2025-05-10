import { admin } from '../config/firebase.js';
import { BrandOwner } from '../types/models/brandOwner.js';
import { deleteCredentialsUsingUID } from './auth.js';

const firestore = admin.firestore();
const brandOwnerCollection = firestore.collection('brandOwner');

/**
 * Get all brand owners
 * @returns {Promise<BrandOwner[]>} Array of brand owners
 */
export const getAllBrandOwners = async (): Promise<BrandOwner[]> => {
    try {
        const snapshot = await brandOwnerCollection.get();
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        } as BrandOwner));
    } catch (error) {
        console.error('Error getting all brand owners:', error);
        throw new Error('Failed to retrieve brand owners');
    }
};

/**
 * Get a brand owner by ID
 * @param {string} id - Brand owner ID
 * @returns {Promise<BrandOwner|null>} Brand owner object or null if not found
 */
export const getBrandOwnerById = async (id: string): Promise<BrandOwner | null> => {
    try {
        const doc = await brandOwnerCollection.doc(id).get();

        if (!doc.exists) {
            return null;
        }

        return {
            ...doc.data(),
            id: doc.id,
        } as BrandOwner;
    } catch (error) {
        console.error(`Error getting brand owner with ID ${id}:`, error);
        throw new Error(`Failed to retrieve brand owner with ID ${id}`);
    }
};

/**
 * Update a brand owner
 * @param {string} id - Brand owner ID
 * @param {Partial<BrandOwner>} data - Brand owner data to update
 * @returns {Promise<BrandOwner|null>} Updated brand owner or null if not found
 */
export const updateBrandOwner = async (
    id: string,
    data: Partial<BrandOwner>
) => {
    try {
        // Check if brand owner exists
        const brandOwnerDoc = await brandOwnerCollection.doc(id).get();

        if (!brandOwnerDoc.exists) {
            return null;
        }

        // Remove sensitive fields from the update
        const { id: _, ...updateData } = data;

        // Update the document
        await brandOwnerCollection.doc(id).update(updateData);

        return true;
    } catch (error) {
        console.error(`Error updating brand owner with ID ${id}:`, error);
        throw new Error(`Failed to update brand owner with ID ${id}`);
    }
};

/**
 * Delete a brand owner
 * @param {string} id - Brand owner ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteBrandOwner = async (id: string): Promise<boolean> => {
    try {
        // Check if brand owner exists
        const brandOwnerDoc = await brandOwnerCollection.doc(id).get();

        if (!brandOwnerDoc.exists) {
            return false;
        }

        // Delete the document
        await brandOwnerCollection.doc(id).delete();

        // Then, delete the customer from Firebase Authentication
        await deleteCredentialsUsingUID(id);

        return true;
    } catch (error) {
        console.error(`Error deleting brand owner with ID ${id}:`, error);
        throw new Error(`Failed to delete brand owner with ID ${id}`);
    }
};
