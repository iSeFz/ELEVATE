import { createSchemaBuilder } from './builder.js';
import { Website, Address } from '../../types/models/common.js';
import { Payment } from '../../types/models/order.js';
import { ProductVariant } from '../../types/models/product.js';
import { paymentMethodValues } from '../../config/order.js';
import { SIZES } from '../../config/product.js';

interface PatternRegex {
    regex: RegExp;
    Hint?: string;
}

export const emailPattern: PatternRegex = {
    regex: /^[\w-]+(\.[\w-]+)*@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*\.[a-zA-Z]{2,}$/,
    Hint: 'Must be a valid email address format'
}
export const phonePattern: PatternRegex = {
    regex: /^01[0-2|5]\d{8}$/,
    Hint: 'Must be a valid Egyptian mobile number starting with 010, 011, 012, or 015 and 8 digits'
}
export const passwordPattern: PatternRegex = {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":_{}|<>]).{8,}$/,
    Hint: 'Must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long'
}
export const usernamePattern: PatternRegex = {
    regex: /^\w{6,20}$/,
    Hint: 'Must be alphanumeric and underscores, 6-20 characters long'
}
export const namePattern: PatternRegex = {
    regex: /^[a-zA-Z\s]{2,50}$/,
    Hint: 'Must contain only letters and spaces, 2-50 characters long'
}

export const websitePattern: PatternRegex = {
    regex: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/,
    Hint: 'Must be a valid URL starting with http:// or https://'
}

export const addressSchema = createSchemaBuilder<Address>()
    .field('postalCode', { type: 'number', required: true })
    .field('building', { type: 'number', required: true })
    .field('city', { type: 'string', required: true, minLength: 1, maxLength: 20 })
    .field('street', { type: 'string', required: true, minLength: 1, maxLength: 100 })
    .field('latitude', { type: 'number', required: false, value: 30.0313294 })
    .field('longitude', { type: 'number', required: false, value: 31.2081442 })
    .build();

export const websiteSchema = createSchemaBuilder<Website>()
    .field('url', {
        type: 'string', required: true,
        value: 'https://example.com', patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
    .field('type', { type: 'string', required: true, minLength: 1, maxLength: 20 })
    .build();

export const paymentSchema = createSchemaBuilder<Payment>()
    .field('method', { type: 'string', required: true, in: paymentMethodValues, value: paymentMethodValues.join(' / ') })
    .field('credentials', { type: 'string', required: true, minLength: 0, maxLength: 20, value: '1234567812345678' })
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
        items: {
            type: 'string',
            value: 'https://example.com/image.jpg', patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
        }
    })
    .field('price', { type: 'number', required: true, value: 100 })
    .field('size', { type: 'string', required: true, value: SIZES.join(' / '), in: SIZES })
    .field('stock', { type: 'number', required: true, value: 50 })
    .build();
