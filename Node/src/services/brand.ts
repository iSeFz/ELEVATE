import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { generateFullyBrandData } from './utils/brand.js';
import { Brand } from '../types/models/brand.js';
import { updateProductsBrandSubscriptionPlan } from './product.js';
import { getSubscriptionPlanDetails } from '../config/subscriptionPlans.js';

const firestore = admin.firestore();
const brandCollection = FIREBASE_COLLECTIONS['brand'];

export const getAllBrands = async (page = 1) => {
    const offset = (page - 1) * 10; // Calculate the offset for pagination
    try {
        const snapshot = await firestore.collection(brandCollection).offset(offset).limit(10).get();
        const brands: Brand[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data() as Brand;
            data.subscription.plan = getSubscriptionPlanDetails(data.subscription.plan as number).name
            brands.push({ ...data, id: doc.id } as Brand);
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
            const data = docSnap.data() as Brand;
            data.subscription.plan = getSubscriptionPlanDetails(data.subscription.plan as number).name
            return { ...data, id: docSnap.id } as Brand;
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
            const data = doc.data() as Brand;
            data.subscription.plan = getSubscriptionPlanDetails(data.subscription.plan as number).name;
            brands.push({ ...data, id: doc.id } as Brand);
        });
        return brands.length > 0 ? brands[0] : null;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addBrand = async (brand: Brand) => {
    try {
        const brandData = generateFullyBrandData(brand);

        const docRef = await firestore.collection(brandCollection).add(brandData);
        return { ...brandData, id: docRef.id };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateBrand = async (brandID: string, newBrandData: Partial<Brand>) => {
    if (!brandID) {
        throw new Error('Please provide a brand ID');
    }

    try {
        const brandRef = firestore.collection(brandCollection).doc(brandID);
        await brandRef.update(newBrandData);

        // If the subscription plan is being updated, update all products for this brand
        if (newBrandData.subscription) {
            await updateProductsBrandSubscriptionPlan(brandID, newBrandData.subscription.plan as number);
        }
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

export const getBrandByOwnerId = async (brandOwnerId: string) => {
    if (!brandOwnerId) {
        throw new Error('Please provide a brand owner ID');
    }
    try {
        const snapshot = await firestore.collection(brandCollection)
            .where('brandOwnerId', '==', brandOwnerId)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        const data = doc.data() as Brand;
        data.subscription.plan = getSubscriptionPlanDetails(data.subscription.plan as number).name
        return { ...data, id: doc.id } as Brand;
    } catch (error: any) {
        throw new Error(error.message);
    }
};