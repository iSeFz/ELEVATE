import { admin } from '../config/firebase.js';
import { checkMissingBrandOwnerData, checkMissingBrandOwnerUpdateData } from './utils/brandOwner.js';
import { BrandOwner } from '../types/models/brandOwner.js';

const firestore = admin.firestore();
const brandOwnerCollection = 'brandOwner';

export const getAllBrandOwners = async () => {
    try {
        const snapshot = await firestore.collection(brandOwnerCollection).get();
        const brandOwners: BrandOwner[] = [];
        snapshot.forEach((doc) => {
            brandOwners.push({ id: doc.id, ...doc.data() } as BrandOwner);
        });
        return brandOwners;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getBrandOwner = async (brandOwnerID: string) => {
    if (!brandOwnerID) {
        throw new Error('Please provide a brand owner ID');
    }
    try {
        const docRef = firestore.collection(brandOwnerCollection).doc(brandOwnerID);
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

export const getBrandOwnerByEmail = async (email: string) => {
    if (!email) {
        throw new Error('Please provide an email');
    }
    try {
        const snapshot = await firestore.collection(brandOwnerCollection)
            .where("email", "==", email)
            .get();

        const brandOwners: BrandOwner[] = [];
        snapshot.forEach((doc) => {
            brandOwners.push({ id: doc.id, ...doc.data() } as BrandOwner);
        });
        return brandOwners.length > 0 ? brandOwners[0] : null;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addBrandOwner = async (brandOwner: BrandOwner) => {
    try {
        const missedBrandOwnerData = checkMissingBrandOwnerData(brandOwner);
        if (missedBrandOwnerData) {
            throw new Error(missedBrandOwnerData);
        }

        const customId = brandOwner.id;
        const { id, ...brandOwnerData } = brandOwner;
        
        if (customId) {
            const docRef = firestore.collection(brandOwnerCollection).doc(customId);
            await docRef.set(brandOwnerData);
            return { id: customId, ...brandOwnerData };
        } else {
            const docRef = await firestore.collection(brandOwnerCollection).add(brandOwnerData);
            return { id: docRef.id, ...brandOwnerData };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateBrandOwner = async (brandOwnerID: string, newBrandOwnerData: Partial<BrandOwner>) => {
    if (!brandOwnerID) {
        throw new Error('Please provide a brand owner ID');
    }
    
    try {
        const missedUpdateData = checkMissingBrandOwnerUpdateData(newBrandOwnerData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        const brandOwnerRef = firestore.collection(brandOwnerCollection).doc(brandOwnerID);
        await brandOwnerRef.update(newBrandOwnerData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteBrandOwner = async (brandOwnerID: string) => {
    if (!brandOwnerID) {
        throw new Error('Please provide a brand owner ID');
    }
    try {
        const brandOwnerRef = firestore.collection(brandOwnerCollection).doc(brandOwnerID);
        await brandOwnerRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};