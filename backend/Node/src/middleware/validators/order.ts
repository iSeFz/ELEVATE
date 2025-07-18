import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { Order, OrderProduct } from '../../types/models/order.js';
import { addressSchema, paymentSchema, phonePattern } from './common.js';
import { shipmentTypeValues } from '../../config/order.js';

const productOrderSchema = createSchemaBuilder<OrderProduct>()
    .field('variantId', { type: 'string', required: true, value: 'variant_12345' })
    .field('productId', { type: 'string', required: true, value: '01234567890' })
    .field('quantity', { type: 'number', required: true, minValue: 1, value: 1 })
    .build();
const expectedCreateOrderData = createSchemaBuilder<Order>()
    .field('products', {
        type: 'array',
        required: true,
        items: {
            type: 'object',
            fields: productOrderSchema,
            required: true,
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

    extractSchemaFieldsMiddleware(expectedCreateOrderData)(req, res, next);
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

    extractSchemaFieldsMiddleware(expectedShipmentData)(req, res, next);
}

const expectedConfirmOrderData = createSchemaBuilder<Order>()
    .field('phoneNumber', {
        type: 'string', required: true, minLength: 11, maxLength: 11,
        value: '01234567890', patternRgx: phonePattern.regex, patternHint: phonePattern.Hint
    })
    .field('pointsRedeemed', { type: 'number', required: false, value: 0 })
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

    extractSchemaFieldsMiddleware(expectedConfirmOrderData)(req, res, next);
}

const expectedRefundProductVariant = createSchemaBuilder<Order["products"][0]>()
    .field('variantId', { type: 'string', required: true })
    .field('productId', { type: 'string', required: true })
    .build();
const expectedRefundOrderData = createSchemaBuilder()
    .field('data', {
        type: 'array', required: true, items: {
            type: 'object',
            fields: expectedRefundProductVariant,
            required: true,
        }
    })
    .build();
export const validateRefundOrder = (req: Request, res: Response, next: NextFunction) => {
    const order = req.body as Order["products"][0];

    const result = validateObjectStrict(order, expectedRefundOrderData);
    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedRefundOrderData)(req, res, next);
}
