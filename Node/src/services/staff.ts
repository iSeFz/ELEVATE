import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { checkMissingStaffUpdateData } from './utils/staff.js';
import { Staff } from '../types/models/staff.js';

const firestore = admin.firestore();
const staffCollection = FIREBASE_COLLECTIONS['staff'];

export const getAllStaff = async () => {
    try {
        const snapshot = await firestore.collection(staffCollection).get();
        const staffMembers: Staff[] = [];
        snapshot.forEach((doc) => {
            staffMembers.push({ ...doc.data(), id: doc.id } as Staff);
        });
        return staffMembers;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getStaff = async (staffID: string) => {
    if (!staffID) {
        throw new Error('Please provide a staff ID');
    }
    try {
        const docRef = firestore.collection(staffCollection).doc(staffID);
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

export const getStaffByEmail = async (email: string) => {
    if (!email) {
        throw new Error('Please provide an email');
    }
    try {
        const snapshot = await firestore.collection(staffCollection)
            .where("email", "==", email)
            .get();

        const staffMembers: Staff[] = [];
        snapshot.forEach((doc) => {
            staffMembers.push({ ...doc.data(), id: doc.id } as Staff);
        });
        return staffMembers.length > 0 ? staffMembers[0] : null;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addStaff = async (staff: Staff) => {
    try {
        const { id, password, ...staffData } = staff;

        const docRef = await firestore.collection(staffCollection).add(staffData);
        return { ...staffData, id: docRef.id };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateStaff = async (staffID: string, newStaffData: Partial<Staff>) => {
    if (!staffID) {
        throw new Error('Please provide a staff ID');
    }

    try {
        const missedUpdateData = checkMissingStaffUpdateData(newStaffData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        // Remove password from update data if present
        if (newStaffData.password) {
            const { password, ...dataWithoutPassword } = newStaffData;
            newStaffData = dataWithoutPassword;
        }

        const staffRef = firestore.collection(staffCollection).doc(staffID);
        await staffRef.update(newStaffData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteStaff = async (staffID: string) => {
    if (!staffID) {
        throw new Error('Please provide a staff ID');
    }
    try {
        const staffRef = firestore.collection(staffCollection).doc(staffID);
        await staffRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};