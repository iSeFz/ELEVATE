import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { checkMissingBrandManagerUpdateData } from './utils/brandManager.js';
import { BrandManager } from '../types/models/brandManager.js';

const firestore = admin.firestore();
const brandManagerCollection = FIREBASE_COLLECTIONS['brandManager'];

export const getAllBrandManager = async () => {
    try {
        const snapshot = await firestore.collection(brandManagerCollection).get();
        const brandManagerMembers: BrandManager[] = [];
        snapshot.forEach((doc) => {
            brandManagerMembers.push({ ...doc.data(), id: doc.id } as BrandManager);
        });
        return brandManagerMembers;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getBrandManager = async (brandManagerId: string) => {
    if (!brandManagerId) {
        throw new Error('Please provide a Brand Manager ID');
    }
    try {
        const docRef = firestore.collection(brandManagerCollection).doc(brandManagerId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { ...docSnap.data(), id: docSnap.id };
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getBrandManagerByEmail = async (email: string) => {
    if (!email) {
        throw new Error('Please provide an email');
    }
    try {
        const snapshot = await firestore.collection(brandManagerCollection)
            .where("email", "==", email)
            .get();

        const brandManagerMembers: BrandManager[] = [];
        snapshot.forEach((doc) => {
            brandManagerMembers.push({ ...doc.data(), id: doc.id } as BrandManager);
        });
        return brandManagerMembers.length > 0 ? brandManagerMembers[0] : null;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addBrandManager = async (brandManager: BrandManager) => {
    try {
        const { id, password, ...brandManagerData } = brandManager;

        const docRef = await firestore.collection(brandManagerCollection).add(brandManagerData);
        return { ...brandManagerData, id: docRef.id };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateBrandManager = async (brandManagerId: string, newBrandManagerData: Partial<BrandManager>) => {
    if (!brandManagerId) {
        throw new Error('Please provide a Brand Manager ID');
    }

    try {
        const missedUpdateData = checkMissingBrandManagerUpdateData(newBrandManagerData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        // Remove password from update data if present
        if (newBrandManagerData.password) {
            const { password, ...dataWithoutPassword } = newBrandManagerData;
            newBrandManagerData = dataWithoutPassword;
        }

        const brandManagerRef = firestore.collection(brandManagerCollection).doc(brandManagerId);
        await brandManagerRef.update(newBrandManagerData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteBrandManager = async (brandManagerId: string) => {
    if (!brandManagerId) {
        throw new Error('Please provide a Brand Manager ID');
    }
    try {
        const brandManagerRef = firestore.collection(brandManagerCollection).doc(brandManagerId);
        await brandManagerRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};
