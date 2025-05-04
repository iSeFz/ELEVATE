import { admin } from '../config/firebase.js';
import { checkMissingProductData, checkMissingProductUpdateData } from './utils/product.js';
import { Product } from '../types/models/product.js';
import { Timestamp } from 'firebase-admin/firestore';

const firestore = admin.firestore();
const productCollection = 'product';
const brandCollection = 'brand';

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

export const getProductsByCategory = async (category: string, page: number = 0) => {
    if (!category) {
        throw new Error('Please provide a category');
    }
    try {
        const snapshot = await firestore.collection(productCollection)
            .where("category", "==", category).offset(page*10).limit(10).get();

        const products: Product[] = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getProductsByBrand = async (brandID: string, page: number = 0) => {
    const offset = page * 10; // Calculate the offset for pagination
    if (!brandID) {
        throw new Error('Please provide a brand ID');
    }
    try {
        // Get the brand document to access its productIds array
        const brandDoc = await firestore.collection(brandCollection).doc(brandID).get();

        if (!brandDoc.exists) {
            throw new Error('Brand not found');
        }

        const brandData = brandDoc.data();
        const productIds = brandData?.productIds ?? [];

        if (productIds.length === 0) {
            return []; // Return empty array if no products are associated with this brand
        }

        // Use a batched get operation to retrieve all products by their IDs
        const products: Product[] = [];

        const chunk = productIds.slice(offset, offset + 10);

        const productRefs = chunk.map((id: string) =>
            firestore.collection(productCollection).doc(id)
        );

        const productSnapshots = await firestore.getAll(...productRefs);

        productSnapshots.forEach(doc => {
            if (doc.exists) {
                products.push({ id: doc.id, ...doc.data() } as Product);
            }
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

        const productData: Product = {
            brandOwnerId: product.brandOwnerId,
            brandId: product.brandId,
            name: product.name,
            category: product.category,
            description: product.description,
            material: product.material,
            dateCreated: product.dateCreated ?? Timestamp.now(),
            averageRating: product.averageRating ?? 0,
            totalReviews: product.totalReviews ?? 0,
            department: product.department ?? [],
            reviewIds: product.reviewIds ?? [],
            variants: product.variants ?? [],
        }

        // Create the product document
        let productId;
        if (customId) {
            const docRef = firestore.collection(productCollection).doc(customId);
            await docRef.set(productData);
            productId = customId;
        } else {
            const docRef = await firestore.collection(productCollection).add(productData);
            productId = docRef.id;
        }

        // Update the brand's productIds array with the new product ID
        if (productData.brandId) {
            const brandRef = firestore.collection(brandCollection).doc(productData.brandId);
            await brandRef.update({
                productIds: admin.firestore.FieldValue.arrayUnion(productId)
            });
        }

        return { id: productId, ...productData };
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

        // Return the updated product
        const updatedProduct = await getProduct(productID);
        return updatedProduct;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteProduct = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    try {
        // First, get the product to find its brand
        const product = await getProduct(productID);
        if (!product) {
            throw new Error('Product not found');
        }

        // Delete the product
        const productRef = firestore.collection(productCollection).doc(productID);
        await productRef.delete();

        // Remove product ID from the brand's productIds array
        if (product.brandId) {
            const brandRef = firestore.collection(brandCollection).doc(product.brandId);
            await brandRef.update({
                productIds: admin.firestore.FieldValue.arrayRemove(productID)
            });
        }

        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};