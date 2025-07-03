import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { generateFullyProductData } from './utils/product.js';
import { Product, ProductVariant } from '../types/models/product.js';
import { Timestamp } from 'firebase-admin/firestore';
import { SubscriptionPlan } from '../config/subscriptionPlans.js';
import { processProductEmbeddings, updateProductEmbeddings } from './imageSearch/index.js';
import { deleteProductEmbeddings } from './imageSearch/upstachVectorDatabase.js';

const firestore = admin.firestore();
const productCollection = FIREBASE_COLLECTIONS['product'];

const normalizeString = (str: string): string => {
    return str.trim().toLowerCase();
}

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

export const getAllBrandProductsWithoutPagination = async (brandId: string): Promise<Product[]> => {
    if (!brandId) {
        throw new Error('Please provide a brand ID');
    }

    try {
        const ref = firestore.collection(productCollection);
        const query = ref.where("brandId", "==", brandId);

        const snapshot = await query.get();
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            const product = doc.data() as Product;
            products.push({ ...product, id: doc.id } as Product);
        });

        return products;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

// Helper to fetch products with custom query and pagination
const fetchProducts = async (
    queryBuilder: (ref: FirebaseFirestore.CollectionReference) => FirebaseFirestore.Query,
    page: number = 1,
    limit: number = 10
) => {
    const offset = (page - 1) * limit;
    try {
        const ref = firestore.collection(productCollection);
        let query = queryBuilder(ref).offset(offset).limit(limit);
        const snapshot = await query.get();
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            const product = doc.data() as Product;
            products.push({ ...product, id: doc.id } as Product);
        });
        const hasNextPage = products.length === limit;
        return {
            products,
            pagination: {
                page,
                limit,
                hasNextPage
            }
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getAllProducts = async (page: number = 1, limit: number = 10) =>
    fetchProducts(
        ref => ref.orderBy("brandSubscriptionPlan", "desc").orderBy("createdAt", "desc"),
        page,
        limit
    );

export const getProductsByCategory = async (category: string, page: number = 1, limit: number = 10) => {
    if (!category) throw new Error('Please provide a category');
    return fetchProducts(
        ref => ref
            .where("category", "==", normalizeString(category))
            .orderBy("brandSubscriptionPlan", "desc")
            .orderBy("createdAt", "desc"),
        page,
        limit
    );
};

export const getProductsByBrand = async (brandID: string, page: number = 1, limit: number = 9) => {
    if (!brandID) throw new Error('Please provide a brand ID');
    return fetchProducts(
        ref => ref
            .where("brandId", "==", brandID)
            .orderBy("createdAt", "desc"),
        page,
        limit
    );
};

export const getProductsByDepartment = async (departmentValue: string, page: number = 1, limit: number = 10) => {
    if (!departmentValue) throw new Error('Please provide a department value');
    return fetchProducts(
        ref => ref
            .where("department", "array-contains", normalizeString(departmentValue))
            .orderBy("brandSubscriptionPlan", "desc")
            .orderBy("createdAt", "desc"),
        page,
        limit
    );
};

/**
 * Get most popular products based on wishlist count
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of products per page (default: 10)
 * @param minWishlistCount - Minimum wishlist count to filter by (optional)
 * @returns Promise with products array and pagination info
 */
export const getMostPopularProducts = async (
    page: number = 1,
    limit: number = 10,
) => {
    return fetchProducts(
        ref => ref.orderBy("wishlistCount", "desc")
            .orderBy("brandSubscriptionPlan", "desc")
            .orderBy("createdAt", "desc"),
        page,
        limit
    );
};

export const getTopRatedProducts = async (page: number = 1, limit: number = 10) => {
    return fetchProducts(
        ref => ref.orderBy("reviewSummary.averageRating", "desc")
            .orderBy("brandSubscriptionPlan", "desc")
            .orderBy("createdAt", "desc"),
        page,
        limit
    );
}

export const getProduct = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    try {
        const docRef = firestore.collection(productCollection).doc(productID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const productData = docSnap.data() as Product;
            return { ...productData, id: docSnap.id } as Product;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addProduct = async (product: Product) => {
    try {
        const productData = generateFullyProductData(product);

        // Ensure all variants have IDs
        const variantsWithIds = ensureVariantIds(productData.variants);
        productData.variants = variantsWithIds;

        // Ensure brandSubscriptionPlan is numeric
        if (typeof productData.brandSubscriptionPlan !== 'number') {
            console.error('Invalid brandSubscriptionPlan:', productData.brandSubscriptionPlan);
            throw new Error('brandSubscriptionPlan must be a numeric SubscriptionPlan enum value');
        }

        // Create the product document
        let productId;
        const docRef = await firestore.collection(productCollection).add(productData);
        productId = docRef.id;

        const createdProduct = { ...productData, id: productId };

        // Process image embeddings asynchronously (don't block the response)
        processProductEmbeddings(createdProduct).catch(error => {
            console.error(`Failed to process embeddings for new product ${productId}:`, error);
        });

        return createdProduct;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const increaseProductWishlistCount = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }

    try {
        const productRef = firestore.collection(productCollection).doc(productID);
        await productRef.update({
            wishlistCount: admin.firestore.FieldValue.increment(1),
            updatedAt: Timestamp.now()
        });
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const updateProduct = async (productID: string, newProductData: Partial<Product>) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }

    try {
        // If variants are being updated, ensure they all have IDs
        if (newProductData.variants) {
            newProductData.variants = ensureVariantIds(newProductData.variants);
        }
        // ensure all fixed values are normalized
        if (newProductData.category) {
            newProductData.category = normalizeString(newProductData.category);
        }
        if (newProductData.department) {
            newProductData.department = newProductData.department.map(dept => normalizeString(dept));
        }
        if (newProductData.material) {
            newProductData.material = normalizeString(newProductData.material);
        }

        // Always update the timestamp
        newProductData.updatedAt = Timestamp.now();

        const productRef = firestore.collection(productCollection).doc(productID);
        await productRef.update(newProductData);

        // If images were updated, refresh embeddings asynchronously
        if (newProductData.variants) {
            const updatedProduct = await getProduct(productID);
            if (updatedProduct) {
                updateProductEmbeddings(productID, updatedProduct).catch(error => {
                    console.error(`Failed to update embeddings for product ${productID}:`, error);
                });
            }
        }

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
        // First, get the product to ensure it exists
        const product = await getProduct(productID);
        if (!product) {
            throw new Error('Product not found');
        }

        // Query and delete all reviews associated with this product
        const reviewSnapshot = await firestore.collection(FIREBASE_COLLECTIONS['review'])
            .where('productId', '==', productID)
            .get();

        const reviewDeletePromises: Promise<FirebaseFirestore.WriteResult>[] = [];
        reviewSnapshot.forEach((doc) => {
            reviewDeletePromises.push(firestore.collection(FIREBASE_COLLECTIONS['review']).doc(doc.id).delete());
        });

        if (reviewDeletePromises.length > 0) {
            await Promise.all(reviewDeletePromises);
        }

        // Delete the product
        const productRef = firestore.collection(productCollection).doc(productID);
        await productRef.delete();

        deleteProductEmbeddings(productID);

        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getProductVariant = async (productID: string, variantID: string) => {
    if (!productID || !variantID) {
        throw new Error('Product ID and variant ID are required');
    }

    try {
        const product = await getProduct(productID);
        if (!product) {
            throw new Error('Product not found');
        }

        const variant = product.variants.find(v => v.id === variantID);
        if (!variant) {
            return null;
        }

        return variant;
    } catch (error: any) {
        throw new Error(`Failed to get product variant: ${error.message}`);
    }
};


// Function to add a new variant to a product
export const addProductVariant = async (productID: string, variant: ProductVariant) => {
    if (!productID) {
        console.error('Product ID is required');
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

export const updateProductsBrandSubscriptionPlan = async (brandId: string, newPlan: SubscriptionPlan) => {
    // Ensure newPlan is numeric
    if (typeof newPlan !== 'number') {
        throw new Error('newPlan must be a numeric SubscriptionPlan enum value');
    }

    // Update all products for a brand with the new subscription plan
    const productsSnapshot = await firestore.collection(productCollection)
        .where('brandId', '==', brandId)
        .get();
    const batch = firestore.batch();
    productsSnapshot.forEach(doc => {
        batch.update(doc.ref, { brandSubscriptionPlan: newPlan });
    });
    await batch.commit();
};
