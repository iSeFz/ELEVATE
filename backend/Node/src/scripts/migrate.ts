// Migration script to update customer address structure
// Moves 'address' field to 'addresses' array and removes the old 'address' field
// Usage: Import and call runCustomerAddressMigration()

import { Timestamp } from 'firebase-admin/firestore';
import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { Product } from '../types/models/product.js';
import { normalizeString } from '../services/utils/product.js';

const firestore = admin.firestore();


const normalizeProduct = (product: Product): Partial<Product> => {
    const normalized: Partial<Product> = {};

    if (product.material) {
        normalized.material = normalizeString(product.material);
    }

    if (product.category) {
        normalized.category = normalizeString(product.category);
    }

    if (product.department && Array.isArray(product.department)) {
        normalized.department = product.department.map(dept => normalizeString(dept));
    }

    return normalized;
};

export const migrate = async (): Promise<{
    processed: number;
    normalized: number;
    errors: string[]
}> => {
    try {
        console.log('Starting product normalization...');

        // Get all products
        const productsSnapshot = await firestore
            .collection(FIREBASE_COLLECTIONS['product'])
            .get();

        if (productsSnapshot.empty) {
            return { processed: 0, normalized: 0, errors: [] };
        }

        const batch = firestore.batch();
        const errors: string[] = [];
        let processedCount = 0;
        let normalizedCount = 0;
        let batchCount = 0;
        const BATCH_SIZE = 500; // Firestore batch limit

        for (const doc of productsSnapshot.docs) {
            try {
                const productData = doc.data() as Product;
                const normalizedData = normalizeProduct(productData);
                
                batch.update(doc.ref, normalizedData);
                normalizedCount++;
                batchCount++;
                processedCount++;

                // Execute batch when it reaches the limit
                if (batchCount >= BATCH_SIZE) {
                    await batch.commit();
                    batchCount = 0;
                }
            } catch (error: any) {
                errors.push(`Error normalizing product ${doc.id}: ${error.message}`);
                console.error(`Error normalizing product ${doc.id}:`, error.message);
            }
        }

        // Commit remaining batch if any
        if (batchCount > 0) {
            await batch.commit();
            console.log(`Final batch committed: ${batchCount} products normalized`);
        }

        if (errors.length > 0) {
            console.error(`Encountered ${errors.length} errors during normalization:`);
            errors.forEach(error => console.error(`- ${error}`));
        }

        return {
            processed: processedCount,
            normalized: normalizedCount,
            errors
        };
    } catch (error: any) {
        console.error('Fatal error during product normalization:', error);
        throw error;
    }
};