import { Request, Response, NextFunction } from 'express';
import { validateObjectStructure } from './common.js';
import { Order, orderDataValidators } from '../../types/models/order.js';

const expectedCreateOrderData: Partial<Order> = {
    products: [
        {
            variantId: "String",
            productId: "String",
            quantity: 1,
            name: "String",
            size: "String",
            color: "String",
            price: 0,
            imageURL: "String",
        }
    ]
}
export const validateCreateOrder = (req: Request, res: Response, next: NextFunction) => {
    const order = req.body as Order;
    if (!validateObjectStructure(order, expectedCreateOrderData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expectedCreateOrderData
        });
    }

    const isOrderValid = orderDataValidators(order);
    if (!isOrderValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid order data types.',
            expectedFormat: expectedCreateOrderData
        });
    }

    next();
}

const expectedConfirmOrderData: Partial<Order> = {
    address: {
        postalCode: 123456,
        building: 123,
        city: "String",
        street: "String",
        latitude: 30.0313294,
        longitude: 31.2081442,
    },
    phoneNumber: "String",
    pointsRedeemed: 0,
    payment: {
        method: "String",
        credentials: "credentials",
    },
}
export const validateConfirmOrder = (req: Request, res: Response, next: NextFunction) => {
    const order = req.body as Order;
    // Check if the overall structure matches
    if (!validateObjectStructure(order, expectedConfirmOrderData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedConfirmOrderData
        });
    }

    const isOrderValid = orderDataValidators(order);
    if (!isOrderValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid order data types.',
            expectedFormat: expectedConfirmOrderData
        });
    }

    next();
}
