import { Request, Response } from 'express';
import { NotificationService } from '../services/notifications.js';

/**
 * Save FCM token for push notifications
 */
export const saveFCMToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'User authentication required'
            });
            return;
        }

        if (!fcmToken) {
            res.status(400).json({
                status: 'error',
                message: 'FCM token is required'
            });
            return;
        }

        await NotificationService.saveFCMToken(userId, fcmToken);

        res.json({
            status: 'success',
            message: 'FCM token saved successfully'
        });
    } catch (error: any) {
        console.error('Error saving FCM token:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to save FCM token'
        });
    }
}
