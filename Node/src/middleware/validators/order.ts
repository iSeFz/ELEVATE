import { Request, Response, NextFunction } from 'express';
import { validateObjectStructure } from './common.js';
import { Order, orderDataValidators } from '../../types/models/order.js';
import { addressDataValidators } from '../../types/models/common.js';

const expectedCreateOrderData: Partial<Order> = {
    products: [
        {
            variantId: "String",
            productId: "String",
            quantity: 1
        }
    ] as Order['products']
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

const expectedShipmentData = {
    address: {
        city: "",
        postalCode: 0,
        street: "",
        building: 0,
        latitude: 30.0313294,
        longitude: 31.2081442,
    },
    shipmentType: "Express or Standard"
};
export const validateCalculateShipmentFees = (req: Request, res: Response, next: NextFunction) => {
    const order = req.body as typeof expectedShipmentData;
    if (!validateObjectStructure(order, expectedShipmentData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format for shipment fees calculation',
            expectedFormat: expectedShipmentData
        });
    }
    // Validate address structure
    if (!order.address || !addressDataValidators(order.address)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid address data types.',
            expectedFormat: expectedShipmentData
        });
    }
    // Validate shipmentType that should be Express or Standard
    if (!order.shipmentType || typeof order.shipmentType !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid shipment type. It should be a string.',
            expectedFormat: expectedShipmentData
        });
    }
    // Ensure shipmentType is either 'Express' or 'Standard'
    const validShipmentTypes = ['Express', 'Standard'];
    if (!validShipmentTypes.includes(order.shipmentType)) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid shipment type. It should be one of: ${validShipmentTypes.join(', ')}`,
            expectedFormat: expectedShipmentData
        });
    }

    next();
}

const expectedConfirmOrderData: Partial<Order> = {
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
