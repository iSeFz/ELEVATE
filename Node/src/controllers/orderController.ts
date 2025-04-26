import { Request, Response } from 'express';
import * as orderService from '../services/order.js';
import { Order } from '../types/models/order.js';
import { Customer } from '../types/models/customer.js';
import { FirestoreReference } from '../types/models/common.js';

export const getAllOrders = async (req: Request, res: Response) => {
    // This route is already protected by the authorize middleware in the router
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
        
        // Authorization check is now handled by middleware
        return res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getOrdersByCustomer = async (req: Request, res: Response) => {
    try {
        const requestingUserID = req.user?.id;
        const userRole = req.user?.role;
        
        // For non-admin/staff users, enforce using their own ID
        if (userRole !== 'admin' && userRole !== 'staff') {
            const orders = await orderService.getOrdersByCustomer(requestingUserID!);
            return res.status(200).json({ status: 'success', data: orders });
        }
        
        // Admin/staff can query any customer's orders
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
        const orderData = req.body;
        const requestingUserID = req.user?.id;
        const userRole = req.user?.role;
        
        // Regular users can only create orders for themselves
        if (userRole !== 'admin' && userRole !== 'staff') {
            if (!orderData.customer || orderData.customer.id !== requestingUserID) {
                // Force the customer ID to be the authenticated user
                orderData.customer = { id: requestingUserID! } as FirestoreReference<Customer>;
            }
        }
        
        // Remove any ID if provided - always use auto-generated IDs for orders
        delete orderData.id;
        
        const newOrder = await orderService.addOrder(orderData);
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
        const userRole = req.user?.role;
        
        // Check if order exists first
        const existingOrder = await orderService.getOrder(orderID);
        if (!existingOrder) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }
        
        // Authorization check is now handled by middleware
        
        // For regular users, limit what fields they can update
        if (userRole !== 'admin' && userRole !== 'staff') {
            const newOrderData = sanitizeOrderData(req.body, 'customer');
            await orderService.updateOrder(orderID, newOrderData);
        } else {
            // Admin/staff can update any order with more fields
            const newOrderData = sanitizeOrderData(req.body, userRole);
            await orderService.updateOrder(orderID, newOrderData);
        }
        
        return res.status(200).json({ status: 'success', message: 'Order updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    // This route is already protected by the authorize middleware in the router
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
    // This route is already protected by the authorize middleware in the router (admin only)
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
const sanitizeOrderData = (newData: any, userRole?: string): Partial<Order> => {
    // Define allowed fields based on user role
    let allowedFields: string[];
    
    if (userRole === 'admin' || userRole === 'staff') {
        // Admin/staff can update all fields
        allowedFields = [
            'address', 'customer', 'dateCreated', 'payment',
            'phoneNumber', 'pointsRedeemed', 'price', 'productVariant',
            'quantity', 'shipment', 'status'
        ];
    } else {
        // Regular customers can only update limited fields
        allowedFields = [
            'address', 'phoneNumber'
        ];
    }
    
    const sanitizedData: Partial<Order> = {};
    
    for (const key in newData) {
        if (allowedFields.includes(key)) {
            sanitizedData[key as keyof Order] = newData[key];
        }
    }
    
    return sanitizedData;
};