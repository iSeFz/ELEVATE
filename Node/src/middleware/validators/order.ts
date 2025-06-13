import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, validateObjectStrict } from './builder.js';
import { Order } from '../../types/models/order.js';
import { addressSchema, paymentSchema, phonePattern } from './common.js';
import { shipmentTypeValues } from '../../config/order.js';

const expectedCreateOrderData = createSchemaBuilder<Order>()
    .field('products', {
        type: 'array',
        required: true,
        items: {
            type: 'object',
            fields: {
                variantId: { type: 'string', required: true, value: 'variant_12345' },
                productId: { type: 'string', required: true, value: '01234567890' },
                quantity: { type: 'number', required: true, minValue: 1, value: 1 }
            }
        }
    })
    .build();
export const validateCreateOrder = (req: Request, res: Response, next: NextFunction) => {
    const order = req.body as Order;
    const result = validateObjectStrict(order, expectedCreateOrderData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}

const expectedShipmentData = createSchemaBuilder()
    .field('address', { type: 'object', required: true, fields: addressSchema })
    .field('shipmentType', {
        type: 'string',
        required: true,
        in: shipmentTypeValues,
        value: shipmentTypeValues.join(' / ')
    })
    .build();
export const validateCalculateShipmentFees = (req: Request, res: Response, next: NextFunction) => {
    const order = req.body;

    const result = validateObjectStrict(order, expectedShipmentData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}

const expectedConfirmOrderData = createSchemaBuilder<Order>()
    .field('phoneNumber', {
        type: 'string', required: true, minLength: 11, maxLength: 11,
        value: '01234567890', patternRgx: phonePattern.regex, patternHint: phonePattern.Hint
    })
    .field('pointsRedeemed', { type: 'number', required: true, value: 0 })
    .field('payment', { type: 'object', required: true, fields: paymentSchema })
    .build();
export const validateConfirmOrder = (req: Request, res: Response, next: NextFunction) => {
    const order = req.body as Order;

    const result = validateObjectStrict(order, expectedConfirmOrderData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    next();
}
