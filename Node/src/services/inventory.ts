import { admin } from '../config/firebase.js';
import { checkMissingInventoryData, checkMissingInventoryUpdateData } from './utils/inventory.js';
import { Inventory } from '../types/models/inventory.js';

const firestore = admin.firestore();
const inventoryCollection = 'inventory';

export const getAllInventories = async () => {
    try {
        const snapshot = await firestore.collection(inventoryCollection).get();
        const inventories: Inventory[] = [];
        snapshot.forEach((doc) => {
            inventories.push({ id: doc.id, ...doc.data() } as Inventory);
        });
        return inventories;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getInventory = async (inventoryID: string) => {
    if (!inventoryID) {
        throw new Error('Please provide an inventory ID');
    }
    try {
        const docRef = firestore.collection(inventoryCollection).doc(inventoryID);
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

export const getInventoryByName = async (name: string) => {
    if (!name) {
        throw new Error('Please provide an inventory name');
    }
    try {
        const snapshot = await firestore.collection(inventoryCollection)
            .where("name", "==", name)
            .get();

        const inventories: Inventory[] = [];
        snapshot.forEach((doc) => {
            inventories.push({ id: doc.id, ...doc.data() } as Inventory);
        });
        return inventories.length > 0 ? inventories[0] : null;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addInventory = async (inventory: Inventory, ownerId?: string) => {
    try {
        const missedInventoryData = checkMissingInventoryData(inventory);
        if (missedInventoryData) {
            throw new Error(missedInventoryData);
        }

        const customId = inventory.id;
        const { id, ...inventoryData } = inventory;
        
        // Initialize empty collections if not provided
        if (!inventoryData.orders) inventoryData.orders = [];
        if (!inventoryData.products) inventoryData.products = [];
        
        // Set denormalized array IDs from references
        if (inventoryData.orders.length > 0) {
            inventoryData.orderIds = inventoryData.orders.map(ref => ref.id);
        } else {
            inventoryData.orderIds = [];
        }
        
        if (inventoryData.products.length > 0) {
            inventoryData.productIds = inventoryData.products.map(ref => ref.id);
        } else {
            inventoryData.productIds = [];
        }
        
        // Set owner ID for authorization if provided
        if (ownerId) {
            inventoryData.ownerId = ownerId;
        }
        
        if (customId) {
            const docRef = firestore.collection(inventoryCollection).doc(customId);
            await docRef.set(inventoryData);
            return { id: customId, ...inventoryData };
        } else {
            const docRef = await firestore.collection(inventoryCollection).add(inventoryData);
            return { id: docRef.id, ...inventoryData };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateInventory = async (inventoryID: string, newInventoryData: Partial<Inventory>) => {
    if (!inventoryID) {
        throw new Error('Please provide an inventory ID');
    }
    
    try {
        const missedUpdateData = checkMissingInventoryUpdateData(newInventoryData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        const inventoryRef = firestore.collection(inventoryCollection).doc(inventoryID);
        await inventoryRef.update(newInventoryData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteInventory = async (inventoryID: string) => {
    if (!inventoryID) {
        throw new Error('Please provide an inventory ID');
    }
    try {
        const inventoryRef = firestore.collection(inventoryCollection).doc(inventoryID);
        await inventoryRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};