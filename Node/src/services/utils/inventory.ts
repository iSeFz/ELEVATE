import { Inventory } from '../../types/models/inventory.js';

export const checkMissingInventoryData = (inventory: any) => {
    const currentInventory = inventory as Inventory;
    if (currentInventory.name == null || currentInventory.capacity == null) {
        return 'Inventory name and capacity are required';
    }
    return null;
};

export const checkMissingInventoryUpdateData = (inventory: any) => {
    if (Object.keys(inventory).length === 0) {
        return 'No data provided for update';
    }
    return null;
};