import { admin } from '../config/firebase.js';
import { checkMissingProductVariantData, checkMissingProductVariantUpdateData } from './utils/productVariant.js';
import { ProductVariant } from '../types/models/productVariant.js';

const firestore = admin.firestore();
const productVariantCollection = 'productVariant';

// Helper function to check if a user is authorized to access a specific product variant
export const checkProductVariantAuthorization = async (productVariantID: string, userId: string, userRole: string) => {
    // Admin and staff users can access all variants
    if (userRole === 'admin' || userRole === 'staff') {
        return true;
    }

    try {
        // Get the product variant
        const variantDoc = await firestore.collection(productVariantCollection).doc(productVariantID).get();
        if (!variantDoc.exists) {
            return false;
        }

        const variantData = variantDoc.data();
        if (!variantData) {
            return false;
        }

        if (variantData.brandOwnerId) {
            return variantData.brandOwnerId === userId;
        } else {
            throw new Error('Brand owner ID not found in product variant data');
        }
    } catch (error) {
        console.error('Error checking product variant authorization:', error);
        return false;
    }
};

// Helper function to check if a user owns a product (directly via brand ownership)
export const checkProductOwnership = async (productID: string, userId: string, userRole: string) => {
    // Admin and staff users can manage all products
    if (userRole === 'admin' || userRole === 'staff') {
        return true;
    }

    try {
        // Get the product
        const productDoc = await firestore.collection('product').doc(productID).get();
        if (!productDoc.exists) {
            return false;
        }

        const productData = productDoc.data();
        if (!productData) {
            return false;
        }

        // Fast path: If we have the denormalized brandOwnerId, use it directly
        if (productData.brandOwnerId) {
            return productData.brandOwnerId === userId;
        }

        // Get the brand reference from the product
        const brandRef = productData.brand;
        if (!brandRef) {
            return false;
        }

        // Get the brand document
        const brandDoc = await brandRef.get();
        if (!brandDoc.exists) {
            return false;
        }

        const brandData = brandDoc.data();
        if (!brandData?.brandOwner) {
            return false;
        }
        
        // Store denormalized data for future checks (optimization)
        await firestore.collection('product').doc(productID).update({
            brandOwnerId: brandData.brandOwner.id
        });

        return brandData.brandOwner.id === userId;
    } catch (error) {
        console.error('Error checking product ownership:', error);
        return false;
    }
};

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
        
        // Populate denormalized fields for authorization
        if (productVariantData.product && !productVariantData.brandId) {
            try {
                // Get the product to extract brand information
                const productDoc = await productVariantData.product.get();
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    if (productData?.brand) {
                        // Get brand data to extract brandId and brandOwnerId
                        const brandDoc = await productData.brand.get();
                        if (brandDoc.exists) {
                            const brandData = brandDoc.data();
                            // Store denormalized data
                            productVariantData.brandId = brandDoc.id;
                            if (brandData?.owner) {
                                productVariantData.brandOwnerId = brandData.owner.id;
                            }
                            // Store brand reference for convenience
                            productVariantData.brand = productData.brand;
                        }
                    }
                }
            } catch (error) {
                console.error('Error populating denormalized fields:', error);
                // Continue without denormalized fields - this doesn't block creation
                // but will make authorization checks less efficient
            }
        }
        
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