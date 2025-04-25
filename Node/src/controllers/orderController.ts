import { Request, Response } from 'express';
import * as orderService from '../services/order.js';
import { Order } from '../types/models/order.js';

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await orderService.getAllOrders();
        return res.status(200).json({ status: 'success', data: orders });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const order = await orderService.getOrder(orderID);
        
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }
        
        return res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getOrdersByCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.query.customerId as string;
        
        if (!customerID) {
            return res.status(400).json({ status: 'error', message: 'Customer ID parameter is required' });
        }
        
        const orders = await orderService.getOrdersByCustomer(customerID);
        return res.status(200).json({ status: 'success', data: orders });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const addOrder = async (req: Request, res: Response) => {
    try {
        const order: Order = req.body;
        const newOrder = await orderService.addOrder(order);
        return res.status(201).json({ 
            status: 'success', 
            message: 'Order created successfully', 
            data: newOrder 
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const newOrderData = sanitizeOrderData(req.body);
        
        // Check if order exists first
        const existingOrder = await orderService.getOrder(orderID);
        if (!existingOrder) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }
        
        await orderService.updateOrder(orderID, newOrderData);
        return res.status(200).json({ status: 'success', message: 'Order updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ status: 'error', message: 'Status is required' });
        }
        
        // Check if order exists first
        const existingOrder = await orderService.getOrder(orderID);
        if (!existingOrder) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }
        
        await orderService.updateOrder(orderID, { status });
        return res.status(200).json({ status: 'success', message: 'Order status updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        
        // Check if order exists first
        const existingOrder = await orderService.getOrder(orderID);
        if (!existingOrder) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }
        
        await orderService.deleteOrder(orderID);
        return res.status(200).json({ status: 'success', message: 'Order deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

// Helper function to sanitize order data
const sanitizeOrderData = (newData: any): Partial<Order> => {
    // List of allowed order fields based on our Order type
    const allowedFields = [
        'address', 'customer', 'dateCreated', 'payment',
        'phoneNumber', 'pointsRedeemed', 'price', 'productVariant',
        'quantity', 'shipment', 'status'
    ];
    
    const sanitizedData: Partial<Order> = {};
    
    for (const key in newData) {
        if (allowedFields.includes(key)) {
            sanitizedData[key as keyof Order] = newData[key];
        }
    }
    
    return sanitizedData;
};