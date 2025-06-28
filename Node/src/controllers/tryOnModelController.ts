import { Request, Response } from 'express';
import { TryOnService } from '../services/tryOnModel.js';
import { ReplicateService } from '../api/replicate-try-on.js';
import { NotificationService } from '../services/notifications.js';
import { TryOnResponse, ReplicateWebhookPayload, CategoryType } from '../config/try-on-model.js';
const port = process.env.PORT || 3000;

export class TryOnController {
    private static readonly url = process.env.NODE_ENV === 'production'
        ? `${process.env.API_BASE_URL}/api/v1`
        : `${process.env.DEV_WEBHOOK_BASE_URL}/api/v1`;
    /**
     * Start virtual try-on process
     */
    static async startTryOn(req: Request, res: Response): Promise<void> {
        try {
            const { productImg, personImg, category = 'upper_body' } = req.body;
            const userId = req.user?.id!;

            // Generate webhook URL
            const webhookUrl = `${TryOnController.url}/utilities/try-on/webhook`;

            // Create try-on request document
            const tryOnRequest = await TryOnService.createTryOnRequest(
                userId,
                productImg,
                personImg,
                category as CategoryType,
                webhookUrl
            );

            // Start Replicate prediction
            const prediction = await ReplicateService.startTryOnPrediction(
                personImg,
                productImg,
                category as CategoryType,
                webhookUrl
            );

            // Update document with prediction ID and processing status
            await TryOnService.updateTryOnRequest(tryOnRequest.id!, {
                predictionId: prediction.id,
                status: 'processing',
                progress: 10
            });

            // Send notification
            await NotificationService.sendTryOnNotification(
                userId,
                'processing',
                tryOnRequest.id!
            );

            const response: TryOnResponse = {
                id: tryOnRequest.id!,
                predictionId: prediction.id,
                status: 'processing',
                message: 'Try-on request submitted successfully. You will receive real-time updates.',
                progress: 10
            };

            res.status(201).json(response);
        } catch (error: any) {
            console.error('Error starting try-on:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to start try-on process',
                error: error.message
            });
        }
    }

    /**
     * Handle Replicate webhook for try-on completion
     */
    static async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            const webhookData: ReplicateWebhookPayload = req.body;
            const { id: predictionId, status, output, error } = webhookData;

            if (!predictionId || !status) {
                console.error('Invalid webhook data:', webhookData);
                res.status(400).json({ error: 'Invalid webhook data' });
                return;
            }

            // Find try-on request by prediction ID
            const tryOnRequest = await TryOnService.getTryOnRequestByPredictionId(predictionId);

            if (!tryOnRequest) {
                console.error(`Try-on request not found for prediction ID: ${predictionId}`);
                res.status(404).json({ error: 'Try-on request not found' });
                return;
            }

            let updateData: any = { status };

            if (status === 'succeeded') {
                const resultUrl = Array.isArray(output) ? output[0] : output;
                updateData = {
                    status: 'succeeded',
                    resultUrl,
                    progress: 100
                };
            } else if (status === 'failed') {
                updateData = {
                    status: 'failed',
                    error: error || 'Processing failed',
                    progress: 0
                };
            }

            // Update Firestore document (this triggers real-time listeners)
            await TryOnService.updateTryOnRequest(tryOnRequest.id!, updateData);

            // Send FCM notification
            await NotificationService.sendTryOnNotification(
                tryOnRequest.userId,
                status,
                tryOnRequest.id!,
                updateData.resultUrl
            );

            res.status(200).json({ received: true });
        } catch (error: any) {
            console.error('Webhook error:', error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    /**
     * Get try-on request details
     */
    static async getTryOnRequest(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const userId = req.user?.id;

            const tryOnRequest = await TryOnService.getTryOnRequest(requestId);

            if (!tryOnRequest) {
                res.status(404).json({
                    status: 'error',
                    message: 'Try-on request not found'
                });
                return;
            }

            // Check if user owns this request
            if (tryOnRequest.userId !== userId) {
                res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
                return;
            }

            res.json({
                status: 'success',
                data: tryOnRequest
            });
        } catch (error: any) {
            console.error('Error getting try-on request:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get try-on request'
            });
        }
    }

    /**
     * Get user's try-on history
     */
    static async getTryOnHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id!;
            const { limit = 10, lastDoc } = req.query;

            const history = await TryOnService.getUserTryOnHistory(
                userId,
                parseInt(limit as string),
                lastDoc as string
            );

            res.json({
                status: 'success',
                data: history,
                pagination: {
                    limit: parseInt(limit as string),
                    hasMore: history.length === parseInt(limit as string)
                }
            });
        } catch (error: any) {
            console.error('Error getting try-on history:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get try-on history'
            });
        }
    }

    /**
     * Delete try-on request
     */
    static async deleteTryOnRequest(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    status: 'error',
                    message: 'User authentication required'
                });
                return;
            }

            const tryOnRequest = await TryOnService.getTryOnRequest(requestId);

            if (!tryOnRequest) {
                res.status(404).json({
                    status: 'error',
                    message: 'Try-on request not found'
                });
                return;
            }

            // Check if user owns this request
            if (tryOnRequest.userId !== userId) {
                res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
                return;
            }

            await TryOnService.deleteTryOnRequest(requestId);

            res.json({
                status: 'success',
                message: 'Try-on request deleted successfully'
            });
        } catch (error: any) {
            console.error('Error deleting try-on request:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to delete try-on request'
            });
        }
    }

    /**
     * Cancel try-on prediction
     */
    static async cancelTryOn(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    status: 'error',
                    message: 'User authentication required'
                });
                return;
            }

            const tryOnRequest = await TryOnService.getTryOnRequest(requestId);

            if (!tryOnRequest || tryOnRequest.userId !== userId) {
                res.status(404).json({
                    status: 'error',
                    message: 'Try-on request not found'
                });
                return;
            }

            // Cancel Replicate prediction if it exists
            if (tryOnRequest.predictionId) {
                await ReplicateService.cancelPrediction(tryOnRequest.predictionId);
            }

            // Update status to canceled
            await TryOnService.updateTryOnRequest(requestId, {
                status: 'failed',
                error: 'Canceled by user'
            });

            res.json({
                status: 'success',
                message: 'Try-on request canceled successfully'
            });
        } catch (error: any) {
            console.error('Error canceling try-on:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to cancel try-on request'
            });
        }
    }
}