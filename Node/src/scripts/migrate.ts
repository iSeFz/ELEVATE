// Migration script to update customer address structure
// Moves 'address' field to 'addresses' array and removes the old 'address' field
// Usage: Import and call runCustomerAddressMigration()

import { Timestamp } from 'firebase-admin/firestore';
import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { Product } from '../types/models/product.js';

const firestore = admin.firestore();

export const migrate = async (): Promise<{ updated: number; errors: string[] }> => {
    try {
        console.log('Starting migration: Adding wishlistCount field to all products...');
        
        // Get all products without pagination
        const productsSnapshot = await firestore.collection(FIREBASE_COLLECTIONS['product']).get();
        
        if (productsSnapshot.empty) {
            console.log('No products found to migrate');
            return { updated: 0, errors: [] };
        }

        const batch = firestore.batch();
        const errors: string[] = [];
        let updateCount = 0;
        let batchCount = 0;
        const BATCH_SIZE = 500; // Firestore batch limit

        for (const doc of productsSnapshot.docs) {
            try {
                const productData = doc.data() as Product;
                
                // Check if wishlistCount already exists to avoid overwriting
                if (productData.wishlistCount === undefined) {
                    batch.update(doc.ref, {
                        wishlistCount: 0,
                        updatedAt: Timestamp.now()
                    });
                    updateCount++;
                    batchCount++;
                }

                // Execute batch when it reaches the limit
                if (batchCount >= BATCH_SIZE) {
                    await batch.commit();
                    console.log(`Batch committed: ${batchCount} products updated`);
                    batchCount = 0;
                }
            } catch (error: any) {
                errors.push(`Error updating product ${doc.id}: ${error.message}`);
                console.error(`Error updating product ${doc.id}:`, error.message);
            }
        }

        // Commit remaining batch if any
        if (batchCount > 0) {
            await batch.commit();
            console.log(`Final batch committed: ${batchCount} products updated`);
        }

        console.log(`Migration completed: ${updateCount} products updated`);
        
        if (errors.length > 0) {
            console.warn(`Migration completed with ${errors.length} errors`);
        }

        return { updated: updateCount, errors };
    } catch (error: any) {
        console.error('Migration failed:', error.message);
        throw new Error(`Migration failed: ${error.message}`);
    }
};