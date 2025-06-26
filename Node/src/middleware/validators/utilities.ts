import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { websitePattern } from './common.js';
import { CATEGORIES } from '../../api/replicate-try-on.js';

const expectedTryOnData = createSchemaBuilder()
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
        in: CATEGORIES, value: `Supported categories are: ${CATEGORIES.join(', ')}`
    })
    .build();
export const validateTryOnRequest = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedTryOnData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedTryOnData)(req, res, next);
};
