import { admin } from '../config/firebase.js';
import { checkMissingBrandData, checkMissingBrandUpdateData } from './utils/brand.js';
import { Brand } from '../types/models/brand.js';

const firestore = admin.firestore();
const brandCollection = 'brand';

export const getAllBrands = async () => {
    try {
        const snapshot = await firestore.collection(brandCollection).get();
        const brands: Brand[] = [];
        snapshot.forEach((doc) => {
            brands.push({ id: doc.id, ...doc.data() } as Brand);
        });
        return brands;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getBrand = async (brandID: string) => {
    if (!brandID) {
        throw new Error('Please provide a brand ID');
    }
    try {
        const docRef = firestore.collection(brandCollection).doc(brandID);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Brand;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getBrandByName = async (brandName: string) => {
    if (!brandName) {
        throw new Error('Please provide a brand name');
    }
    try {
        const snapshot = await firestore.collection(brandCollection)
            .where("brandName", "==", brandName)
            .get();

        const brands: Brand[] = [];
        snapshot.forEach((doc) => {
            brands.push({ id: doc.id, ...doc.data() } as Brand);
        });
        return brands.length > 0 ? brands[0] : null;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addBrand = async (brand: Brand) => {
    try {
        const missedBrandData = checkMissingBrandData(brand);
        if (missedBrandData) {
            throw new Error(missedBrandData);
        }

        const customId = brand.id;
        const { id, ...brandData } = brand;
        
        // Initialize empty collections if not provided
        brandData.addresses ??= [];
        brandData.websites ??= [];
        brandData.phoneNumbers ??= [];
        brandData.productIds ??= [];
        brandData.subscription ??= {
            plan: 'free',
            price: 0,
            startDate: admin.firestore.Timestamp.now(),
            endDate: admin.firestore.Timestamp.fromMillis(admin.firestore.Timestamp.now().toMillis() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
        
        if (customId) {
            const docRef = firestore.collection(brandCollection).doc(customId);
            await docRef.set(brandData);
            return { id: customId, ...brandData };
        } else {
            const docRef = await firestore.collection(brandCollection).add(brandData);
            return { id: docRef.id, ...brandData };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateBrand = async (brandID: string, newBrandData: Partial<Brand>) => {
    if (!brandID) {
        throw new Error('Please provide a brand ID');
    }
    
    try {
        const missedUpdateData = checkMissingBrandUpdateData(newBrandData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        const brandRef = firestore.collection(brandCollection).doc(brandID);
        await brandRef.update(newBrandData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteBrand = async (brandID: string) => {
    if (!brandID) {
        throw new Error('Please provide a brand ID');
    }
    try {
        const brandRef = firestore.collection(brandCollection).doc(brandID);
        await brandRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};