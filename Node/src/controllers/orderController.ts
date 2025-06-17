import { Request, Response } from 'express';
import * as orderService from '../services/order.js';
import * as cartService from '../services/cart.js';
import { validateOrderStatus } from '../services/utils/order.js';
import { OrderStatus } from '../types/models/order.js';
import { fillDataAddressesCoordinates } from '../services/utils/common.js';

export const getAllOrders = async (req: Request, res: Response) => {
    // This route is already protected by the authorize middleware in the router
    try {
        const { status, productId } = req.query;
        const page = parseInt(req.query.page as string) || 1;

        if (status && typeof status === 'string') {
            if (!validateOrderStatus(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status value'
                });
            }
            const result = await orderService.getOrdersByStatus(status as OrderStatus, page);
            return res.status(200).json({ status: 'success', data: result.orders, pagination: result.pagination });
        } else if (productId && typeof productId === 'string') {
            const result = await orderService.getOrdersByProduct(productId, page);
            return res.status(200).json({ status: 'success', data: result.orders, pagination: result.pagination });
        }
        // If no filters are provided, return all orders
        const result = await orderService.getAllOrders(page);
        return res.status(200).json({ status: 'success', data: result.orders, pagination: result.pagination });
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

        const result = await orderService.confirmOrder(orderID, customerID, orderData);
        await cartService.clearCart(customerID); // Clear the cart after confirming the order

        return res.status(200).json({
            status: 'success',
            message: 'Order confirmed successfully',
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const calculateShipmentFees = async (req: Request, res: Response) => {
    try {
        const { address, shipmentType } = req.body; // Express cost*2 (1-2 days), or Standarded (3-5 days)
        const orderID = req.params.id;
        const customerID = req.user?.id!;

        if (!address || !shipmentType) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request data. Please provide address and products.'
            });
        }

        const ensuredAddressWithCoordinates = [address];
        await fillDataAddressesCoordinates(ensuredAddressWithCoordinates);


        const customerOrder = await orderService.getCustomerOrder(orderID, customerID);

        if (customerOrder.status !== OrderStatus.PENDING) {
            return res.status(400).json({
                status: 'error',
                message: 'Shipment fees can only be calculated for pending orders.'
            });
        }

        const shipmentData = await orderService.calculateShipmentFees(ensuredAddressWithCoordinates[0], shipmentType, customerOrder.products);
        await orderService.updateOrderAfterShipment(orderID, shipmentData, ensuredAddressWithCoordinates[0]);

        return res.status(200).json({
            status: 'success',
            message: 'Shipment fees calculated successfully',
            data: shipmentData
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
}

export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const orderID = req.params.id;
        const customerID = req.user?.id!;

        // Check if order exists and belongs to the customer
        const existingOrder = await orderService.getCustomerOrder(orderID, customerID);
        if (!existingOrder) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        if (existingOrder.customerId !== customerID) {
            throw new Error('Unauthorized access to this order');
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

        if (existingOrder.customerId !== customerID) {
            throw new Error('Unauthorized access to this order');
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

export const cleanupExpiredOrders = async (req: Request, res: Response) => {
    try {
        const result = await orderService.cleanupExpiredOrders();
        return res.status(200).json({
            status: 'success',
            message: 'Expired orders cleanup initiated',
            processedCount: result,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error during expired orders cleanup:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to initiate expired orders cleanup' });
    }
};
