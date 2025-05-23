import { Request, Response } from 'express';
import * as orderService from '../services/order.js';
import { validateOrderStatus } from '../services/utils/order.js';
import { Order, OrderStatus } from '../types/models/order.js';

export const getAllOrders = async (req: Request, res: Response) => {
    // This route is already protected by the authorize middleware in the router
    try {
        const { status, productId } = req.query;
        let orders: Order[] = [];

        if (status && typeof status === 'string') {
            if (!validateOrderStatus(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status value'
                });
            }
            orders = await orderService.getOrdersByStatus(status as OrderStatus);
        } else if (productId && typeof productId === 'string') {
            orders = await orderService.getOrdersByProduct(productId);
        } else {
            orders = await orderService.getAllOrders();
        }
        return res.status(200).json({
            status: 'success',
            data: orders
        });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getCustomerOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const customerID = req.user?.id!;

        const order = await orderService.getCustomerOrder(orderID, customerID);

        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        return res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
}

export const addOrder = async (req: Request, res: Response) => {
    try {
        const orderData = req.body;
        const customerId = req.user?.id as string;
        orderData.customerId = customerId;

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

export const confirmCustomerOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const customerID = req.user?.id!;
        const orderData = req.body;

        await orderService.confirmOrder(orderID, customerID, orderData);

        return res.status(200).json({
            status: 'success',
            message: 'Order updated successfully'
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const customerID = req.user?.id!;

        // Check if order exists and belongs to the customer
        const existingOrder = await orderService.getCustomerOrder(orderID, customerID);
        if (!existingOrder) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        await orderService.cancelOrder(orderID);

        return res.status(200).json({
            status: 'success',
            message: 'Order cancelled successfully'
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const refundOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const customerID = req.user?.id!;

        // Check if order exists first
        const existingOrder = await orderService.getCustomerOrder(orderID, customerID);
        if (!existingOrder) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        await orderService.refundOrder(orderID);
        return res.status(200).json({ status: 'success', message: 'Order refunded successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    // This route is already protected by the authorize middleware in the router (admin only)
    try {
        const orderID = req.params.id;
        await orderService.deleteOrder(orderID);
        return res.status(200).json({ status: 'success', message: 'Order deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
