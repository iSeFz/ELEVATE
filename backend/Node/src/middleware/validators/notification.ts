import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';

const expectedFCMTokenSchema = createSchemaBuilder()
    .field('fcmToken', {
        type: 'string', required: true,
        value: 'Valid FCM token format that came from Firebase Cloud Messaging'
    })
    .build();
export const validateFCMToken = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedFCMTokenSchema);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedFCMTokenSchema)(req, res, next);
};