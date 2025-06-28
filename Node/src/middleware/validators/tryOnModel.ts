import { Request, Response, NextFunction } from 'express';
import { CATEGORIES } from '../../config/try-on-model.js';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { websitePattern } from './common.js';

const expectedTryOnRequestSchema = createSchemaBuilder()
    .field('productImg', {
        type: 'string', required: true,
        value: 'https://example.com/image.jpg', patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
    .field('personImg', {
        type: 'string', required: true,
        value: 'https://example.com/image.jpg', patternRgx: websitePattern.regex, patternHint: websitePattern.Hint
    })
    .field('category', {
        type: 'string', required: false,
        value: CATEGORIES.join(', '), in: CATEGORIES
    })
    .build();
export const validateTryOnRequest = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedTryOnRequestSchema);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedTryOnRequestSchema)(req, res, next);
};
