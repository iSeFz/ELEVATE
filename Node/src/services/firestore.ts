export * from './UserService.js';
export * from './BaseService.js';
export * from './auth.js';
export * from './customer.js';

import { admin } from '../config/firebase.js';
import { FirestoreReference } from '../types/models/common.js';

const firestore = admin.firestore();

/**
 * Utility functions to work with references and IDs in a flexible way
 */

/**
 * Convert a document ID to a Firestore reference
 * @param collection The collection name
 * @param docId The document ID
 * @returns Firestore document reference
 */
export const getDocRef = <T>(collection: string, docId: string): FirestoreReference<T> => {
  return firestore.collection(collection).doc(docId) as FirestoreReference<T>;
};

/**
 * Get a document by its ID
 * @param collection The collection name
 * @param docId The document ID
 * @returns The document data or null if not found
 */
export const getDocById = async <T>(collection: string, docId: string): Promise<T | null> => {
  try {
    const docRef = firestore.collection(collection).doc(docId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return { ...docSnap.data(), id: docSnap.id } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${collection} document:`, error);
    return null;
  }
};

/**
 * Get multiple documents by their IDs
 * @param collection The collection name
 * @param docIds Array of document IDs
 * @returns Array of document data
 */
export const getDocsByIds = async <T>(collection: string, docIds: string[]): Promise<T[]> => {
  if (docIds.length === 0) return [];
  
  try {
    // Firestore has a limit of 10 items per in query
    const batchSize = 10;
    const batches = [];
    
    // Split into batches of 10
    for (let i = 0; i < docIds.length; i += batchSize) {
      const batch = docIds.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    // Process each batch
    const results: T[] = [];
    for (const batch of batches) {
      const snapshot = await firestore.collection(collection)
        .where(admin.firestore.FieldPath.documentId(), 'in', batch)
        .get();
      
      snapshot.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id } as T);
      });
    }
    
    return results;
  } catch (error) {
    console.error(`Error fetching multiple ${collection} documents:`, error);
    return [];
  }
};

/**
 * Helper to check if a value is a Firestore reference
 */
export const isFirestoreReference = (value: any): boolean => {
  return value && typeof value === 'object' && value.path && typeof value.get === 'function';
};

/**
 * Extract ID from a reference or return the ID if it's already a string
 */
export const getIdFromRefOrString = (refOrId: FirestoreReference<any> | string): string => {
  if (isFirestoreReference(refOrId)) {
    return (refOrId as FirestoreReference<any>).id;
  }
  return refOrId as string;
};
