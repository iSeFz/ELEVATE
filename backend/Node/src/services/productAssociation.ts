import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { Order } from '../types/models/order.js';
import { Product } from '../types/models/product.js';
import { getProduct } from './product.js';

const firestore = admin.firestore();
const associationCollection = FIREBASE_COLLECTIONS['productAssociation'];

/**
 * Create a consistent association ID for any two products
 * Always puts the lexicographically smaller ID first
 */
const createAssociationId = (productId1: string, productId2: string): string => {
    return productId1 < productId2 ? `${productId1}_${productId2}` : `${productId2}_${productId1}`;
};

/**
 * Get the ordered product IDs for consistent storage
 */
const getOrderedProductIds = (productId1: string, productId2: string): [string, string] => {
    return productId1 < productId2 ? [productId1, productId2] : [productId2, productId1];
};

/**
 * Update product associations when an order is completed
 * @param order - The completed order
 */
export const updateProductAssociations = async (orderProducts: Order["products"]): Promise<void> => {
    if (orderProducts.length < 2) return; // Need at least 2 products for association

    const batch = firestore.batch();
    const products = orderProducts;
    const processedPairs = new Set<string>();

    // Create associations for each unique product pair
    for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
            const productA = products[i].productId;
            const productB = products[j].productId;

            // Skip if same product
            if (productA === productB) continue;

            const associationId = createAssociationId(productA, productB);

            // Skip if we've already processed this pair
            if (processedPairs.has(associationId)) continue;
            processedPairs.add(associationId);

            await incrementAssociation(batch, productA, productB);
        }
    }

    await batch.commit();
};

/**
 * Increment association count between two products
 */
const incrementAssociation = async (
    batch: FirebaseFirestore.WriteBatch,
    productId1: string,
    productId2: string
) => {
    const [orderedProduct1, orderedProduct2] = getOrderedProductIds(productId1, productId2);
    const associationId = createAssociationId(productId1, productId2);
    const docRef = firestore.collection(associationCollection).doc(associationId);

    const doc = await docRef.get();

    if (doc.exists) {
        batch.update(docRef, {
            coOccurrenceCount: admin.firestore.FieldValue.increment(1),
            lastUpdated: admin.firestore.Timestamp.now()
        });
    } else {
        batch.set(docRef, {
            productId: orderedProduct1,
            associatedProductId: orderedProduct2,
            coOccurrenceCount: 1,
            confidence: 0, // Will be calculated in batch job
            lastUpdated: admin.firestore.Timestamp.now()
        });
    }
};

/**
 * Get products frequently bought together with given product
 * @param productId - The main product ID
 * @param limit - Number of recommendations to return
 * @returns Array of recommended products with scores
 */
export const getFrequentlyBoughtTogether = async (
    productId: string,
    page: number = 1,
    limit: number = 10
) => {
    try {
        const offset = (page - 1) * limit;
        // Query where productId is in either field
        const [snapshot1, snapshot2] = await Promise.all([
            firestore
                .collection(associationCollection)
                .where('productId', '==', productId)
                .orderBy('coOccurrenceCount', 'desc')
                .offset(offset)
                .limit(limit)
                .get(),
            firestore
                .collection(associationCollection)
                .where('associatedProductId', '==', productId)
                .orderBy('coOccurrenceCount', 'desc')
                .offset(offset)
                .limit(limit)
                .get()
        ]);

        const associationsMap = new Map<string, any>();

        // Process first query results
        snapshot1.docs.forEach(doc => {
            const association = doc.data();
            const relatedProductId = association.associatedProductId;
            associationsMap.set(relatedProductId, association);
        });

        // Process second query results
        snapshot2.docs.forEach(doc => {
            const association = doc.data();
            const relatedProductId = association.productId;

            // If already exists, keep the one with higher count
            const existing = associationsMap.get(relatedProductId);
            if (!existing || association.coOccurrenceCount > existing.coOccurrenceCount) {
                associationsMap.set(relatedProductId, association);
            }
        });

        // Sort by occurrence count and limit results
        const sortedAssociations = Array.from(associationsMap.values())
            .sort((a, b) => b.coOccurrenceCount - a.coOccurrenceCount)
            .slice(0, limit);

        const recommendations: Product[] = [];
        for (const association of sortedAssociations) {
            // Determine which product is the associated one
            const associatedProductId = association.productId === productId
                ? association.associatedProductId
                : association.productId;

            const productData = await getProduct(associatedProductId);

            if (productData) {
                recommendations.push(productData);
            }
        }

        return {
            recommendations,
            pagination: {
                page,
                limit: recommendations.length,
                hasNextPage: recommendations.length >= limit,
            }
        };
    } catch (error: any) {
        throw new Error(`Failed to get recommendations: ${error.message}`);
    }
};

/**
 * Check if association exists between two products
 */
export const checkAssociationExists = async (
    productId1: string,
    productId2: string
): Promise<boolean> => {
    const associationId = createAssociationId(productId1, productId2);
    const doc = await firestore.collection(associationCollection).doc(associationId).get();
    return doc.exists;
};
