import { admin } from '../config/firebase.js';
import { checkRequiredProductData, generateFullyProductData, sanitizeProductData } from './utils/product.js';
import { Product, ProductVariant } from '../types/models/product.js';
import { Timestamp } from 'firebase-admin/firestore';

const firestore = admin.firestore();
const productCollection = 'product';
const brandCollection = 'brand';

// Helper function to generate unique IDs for product variants
const generateVariantId = (): string => {
    return `variant_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Helper function to ensure all variants have IDs
const ensureVariantIds = (variants: ProductVariant[]): ProductVariant[] => {
    if (!variants || !Array.isArray(variants)) return [];

    return variants.map(variant => {
        // If variant has no ID, generate one
        if (!variant.id) {
            return { ...variant, id: generateVariantId() };
        }
        return variant;
    });
};

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
            .where("category", "==", category).offset(page * 10).limit(10).get();

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
        const missedProductData = checkRequiredProductData(product);
        if (missedProductData) {
            throw new Error(missedProductData);
        }
        const productData = generateFullyProductData(product);

        // Ensure all variants have IDs
        const variantsWithIds = ensureVariantIds(productData.variants);
        productData.variants = variantsWithIds;

        // Create the product document
        let productId;
        const docRef = await firestore.collection(productCollection).add(productData);
        productId = docRef.id;

        // Update the brand's productIds array with the new product ID
        if (productData.brandId) {
            const brandRef = firestore.collection(brandCollection).doc(productData.brandId);
            await brandRef.update({
                productIds: admin.firestore.FieldValue.arrayUnion(productId)
            });
        }

        return { ...productData, id: productId };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateProduct = async (productID: string, newProductData: Partial<Product>) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }

    newProductData = sanitizeProductData(newProductData);

    try {
        // If variants are being updated, ensure they all have IDs
        if (newProductData.variants) {
            newProductData.variants = ensureVariantIds(newProductData.variants);
        }

        // Always update the timestamp
        newProductData.updatedAt = Timestamp.now();

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


// Function to add a new variant to a product
export const addProductVariant = async (productID: string, variant: ProductVariant) => {
    if (!productID) {
        throw new Error('Product ID is required');
    }

    try {
        // Ensure the variant has an ID
        variant.id ??= generateVariantId();

        const productRef = firestore.collection(productCollection).doc(productID);
        await productRef.update({
            variants: admin.firestore.FieldValue.arrayUnion(variant),
            updatedAt: Timestamp.now()
        });

        return variant;
    } catch (error: any) {
        throw new Error(`Failed to add product variant: ${error.message}`);
    }
};

// Function to update a specific variant
export const updateProductVariant = async (productID: string, variantID: string, updatedVariant: Partial<ProductVariant>) => {
    if (!productID || !variantID) {
        throw new Error('Product ID and variant ID are required');
    }

    try {
        const product = await getProduct(productID);
        if (!product) {
            throw new Error('Product not found');
        }

        const variantIndex = product.variants.findIndex(v => v.id === variantID);
        if (variantIndex === -1) {
            throw new Error('Variant not found');
        }

        // Create updated variants array
        const updatedVariants = [...product.variants];
        updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            ...updatedVariant,
            id: variantID // Ensure ID remains unchanged
        };

        // Update the product with the modified variants array
        await firestore.collection(productCollection).doc(productID).update({
            variants: updatedVariants,
            updatedAt: Timestamp.now()
        });

        return updatedVariants[variantIndex];
    } catch (error: any) {
        throw new Error(`Failed to update product variant: ${error.message}`);
    }
};

// Function to delete a specific variant
export const deleteProductVariant = async (productID: string, variantID: string) => {
    if (!productID || !variantID) {
        throw new Error('Product ID and variant ID are required');
    }

    try {
        const product = await getProduct(productID);
        if (!product) {
            throw new Error('Product not found');
        }

        const variantToRemove = product.variants.find(v => v.id === variantID);
        if (!variantToRemove) {
            throw new Error('Variant not found');
        }

        // Filter out the variant to remove
        const updatedVariants = product.variants.filter(v => v.id !== variantID);

        // Update the product with the modified variants array
        await firestore.collection(productCollection).doc(productID).update({
            variants: updatedVariants,
            updatedAt: Timestamp.now()
        });

        return true;
    } catch (error: any) {
        throw new Error(`Failed to delete product variant: ${error.message}`);
    }
};