import { createSchemaBuilder } from './builder.js';
import { Website, Address } from '../../types/models/common.js';
import { Payment } from '../../types/models/order.js';
import { ProductVariant } from '../../types/models/product.js';

export const addressSchema = createSchemaBuilder<Address>()
    .field('postalCode', { type: 'number', required: true })
    .field('building', { type: 'number', required: true })
    .field('city', { type: 'string', required: true, minLength: 1, maxLength: 20 })
    .field('street', { type: 'string', required: true, minLength: 1, maxLength: 100 })
    .field('latitude', { type: 'number', required: true, value: 30.0313294 })
    .field('longitude', { type: 'number', required: true, value: 31.2081442 })
    .build();

export const websiteSchema = createSchemaBuilder<Website>()
    .field('url', { type: 'string', required: true, value: 'https://example.com' })
    .field('type', { type: 'string', required: true, minLength: 1, maxLength: 20 })
    .build();

export const paymentSchema = createSchemaBuilder<Payment>()
    .field('method', { type: 'string', required: true, minLength: 1, maxLength: 20, value: 'Cash-On-Delivery' })
    .field('credentials', { type: 'string', required: true, minLength: 16, maxLength: 16, value: '1234567812345678' })
    .build();

export const productVariantSchema = createSchemaBuilder<ProductVariant>()
    .field('colors', {
        type: 'array',
        required: true,
        items: { type: 'string', minLength: 1, maxLength: 30, value: 'Red' }
    })
    .field('discount', { type: 'number', required: true, value: 0 })
    .field('images', {
        type: 'array',
        required: true,
        items: { type: 'string', value: 'https://example.com/image.jpg' }
    })
    .field('price', { type: 'number', required: true, value: 100 })
    .field('size', { type: 'string', required: true, minLength: 1, maxLength: 5, value: 'M' })
    .field('stock', { type: 'number', required: true, value: 50 })
    .build();
