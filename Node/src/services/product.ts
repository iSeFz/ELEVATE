import { admin } from '../config/firebase.js';
import { checkMissingProductData, checkMissingProductUpdateData } from './utils/product.js';
import { Product } from '../types/models/product.js';
import { Timestamp } from 'firebase-admin/firestore';

const firestore = admin.firestore();
const productCollection = 'product';

export const getAllProducts = async () => {
    try {
        const snapshot = await firestore.collection(productCollection).get();
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getProduct = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    try {
        const docRef = firestore.collection(productCollection).doc(productID);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getProductsByCategory = async (category: string) => {
    if (!category) {
        throw new Error('Please provide a category');
    }
    try {
        const snapshot = await firestore.collection(productCollection)
            .where("category", "==", category)
            .get();

        const products: Product[] = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getProductsByBrand = async (brandID: string) => {
    if (!brandID) {
        throw new Error('Please provide a brand ID');
    }
    try {
        const brandRef = firestore.collection('brand').doc(brandID);
        const snapshot = await firestore.collection(productCollection)
            .where("brand", "==", brandRef)
            .get();

        const products: Product[] = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addProduct = async (product: Product) => {
    try {
        const missedProductData = checkMissingProductData(product);
        if (missedProductData) {
            throw new Error(missedProductData);
        }

        const customId = product.id;
        const { id, ...productData } = product;
        
        // Initialize empty arrays and default values if not provided
        if (!productData.dateCreated) productData.dateCreated = Timestamp.now();
        if (!productData.averageRating) productData.averageRating = 0;
        if (!productData.totalReviews) productData.totalReviews = 0;
        if (!productData.department) productData.department = [];
        if (!productData.reviews) productData.reviews = [];
        if (!productData.variants) productData.variants = [];
        if (!productData.stock) productData.stock = 0;
        
        if (customId) {
            const docRef = firestore.collection(productCollection).doc(customId);
            await docRef.set(productData);
            return { id: customId, ...productData };
        } else {
            const docRef = await firestore.collection(productCollection).add(productData);
            return { id: docRef.id, ...productData };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateProduct = async (productID: string, newProductData: Partial<Product>) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    
    try {
        const missedUpdateData = checkMissingProductUpdateData(newProductData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        const productRef = firestore.collection(productCollection).doc(productID);
        await productRef.update(newProductData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteProduct = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    try {
        const productRef = firestore.collection(productCollection).doc(productID);
        await productRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};