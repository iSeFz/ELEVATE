import { Order } from '../../types/models/order.js';

export const checkMissingOrderData = (order: any) => {
    const currentOrder = order as Order;
    if (currentOrder.address == null || currentOrder.customer == null || 
        currentOrder.productVariant == null || currentOrder.quantity == null ||
        currentOrder.price == null || currentOrder.phoneNumber == null) {
        return 'Address, customer, product variant, quantity, price, and phone number are required';
    }
    return null;
};

export const checkMissingOrderUpdateData = (order: any) => {
    if (Object.keys(order).length === 0) {
        return 'No data provided for update';
    }
    return null;
};