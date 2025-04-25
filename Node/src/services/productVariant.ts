import { admin } from '../config/firebase.js';
import { checkMissingProductVariantData, checkMissingProductVariantUpdateData } from './utils/productVariant.js';
import { ProductVariant } from '../types/models/productVariant.js';

const firestore = admin.firestore();
const productVariantCollection = 'productVariant';

export const getAllProductVariants = async () => {
    try {
        const snapshot = await firestore.collection(productVariantCollection).get();
        const productVariants: ProductVariant[] = [];
        snapshot.forEach((doc) => {
            productVariants.push({ id: doc.id, ...doc.data() } as ProductVariant);
        });
        return productVariants;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getProductVariant = async (productVariantID: string) => {
    if (!productVariantID) {
        throw new Error('Please provide a product variant ID');
    }
    try {
        const docRef = firestore.collection(productVariantCollection).doc(productVariantID);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getProductVariantsByProduct = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    try {
        const productRef = firestore.collection('product').doc(productID);
        const snapshot = await firestore.collection(productVariantCollection)
            .where("product", "==", productRef)
            .get();

        const productVariants: ProductVariant[] = [];
        snapshot.forEach((doc) => {
            productVariants.push({ id: doc.id, ...doc.data() } as ProductVariant);
        });
        return productVariants;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addProductVariant = async (productVariant: ProductVariant) => {
    try {
        const missedProductVariantData = checkMissingProductVariantData(productVariant);
        if (missedProductVariantData) {
            throw new Error(missedProductVariantData);
        }

        const customId = productVariant.id;
        const { id, ...productVariantData } = productVariant;
        
        // Initialize empty arrays and default values if not provided
        if (!productVariantData.colors) productVariantData.colors = [];
        if (!productVariantData.images) productVariantData.images = [];
        if (!productVariantData.discount) productVariantData.discount = 0;
        if (!productVariantData.size) productVariantData.size = '';
        
        if (customId) {
            const docRef = firestore.collection(productVariantCollection).doc(customId);
            await docRef.set(productVariantData);
            return { id: customId, ...productVariantData };
        } else {
            const docRef = await firestore.collection(productVariantCollection).add(productVariantData);
            return { id: docRef.id, ...productVariantData };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateProductVariant = async (productVariantID: string, newProductVariantData: Partial<ProductVariant>) => {
    if (!productVariantID) {
        throw new Error('Please provide a product variant ID');
    }
    
    try {
        const missedUpdateData = checkMissingProductVariantUpdateData(newProductVariantData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        const productVariantRef = firestore.collection(productVariantCollection).doc(productVariantID);
        await productVariantRef.update(newProductVariantData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteProductVariant = async (productVariantID: string) => {
    if (!productVariantID) {
        throw new Error('Please provide a product variant ID');
    }
    try {
        const productVariantRef = firestore.collection(productVariantCollection).doc(productVariantID);
        await productVariantRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};