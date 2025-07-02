import { Request, Response } from 'express';
import { TryOnService } from '../services/tryOnModel.js';
import { ReplicateService } from '../api/replicate-try-on.js';
import * as FalAIService from '../api/fal-ai-try-on.js';
import { NotificationService } from '../services/notifications.js';
import { TryOnResponse, ReplicateWebhookPayload, FalAICategoryType, ReplicateCategoryType, CategoryType } from '../config/try-on-model.js';

type Platform = "replicate" | "falAI";
type Status = 'pending' | 'processing' | 'succeeded' | 'failed';

export class TryOnController {
    private static readonly url = process.env.NODE_ENV === 'production'
        ? `${process.env.API_BASE_URL}/api/v1`
        : `${process.env.DEV_WEBHOOK_BASE_URL}/api/v1`;
    /**
     * Start virtual try-on process
     */
    static async startTryOn(req: Request, res: Response): Promise<void> {
        try {
            const { productImg, personImg } = req.body;
            const platform: Platform = (req.query.platform as Platform | null) ?? "replicate";
            const category: CategoryType = TryOnController.setCategory(req.body.category, platform);
            const userId = req.user?.id!;

            // Generate webhook URL
            const replicateWebhookUrl = `${TryOnController.url}/utilities/try-on/webhook/replicate`;
            const falAIWebhookUrl = `${TryOnController.url}/utilities/try-on/webhook/falAI`;

            // Create try-on request document
            const tryOnRequest = await TryOnService.createTryOnRequest(
                userId,
                productImg,
                personImg,
                category,
                (platform === "replicate" ? replicateWebhookUrl : falAIWebhookUrl),
            );

            // Start Replicate prediction
            let prediction;

            if (platform === "replicate") {
                prediction = await ReplicateService.startTryOnPrediction(
                    personImg,
                    productImg,
                    category as ReplicateCategoryType,
                    replicateWebhookUrl
                );
            } else {
                prediction = await FalAIService.startTryOnPrediction(
                    personImg,
                    productImg,
                    category as FalAICategoryType,
                    falAIWebhookUrl
                )
            }

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

    private static setCategory(category: string | null, platform: Platform): CategoryType {
        if (!category) {
            return platform === "replicate" ? 'upper_body' : 'auto';
        } else if (platform === "replicate" && !ReplicateService.CATEGORIES.includes(category as ReplicateCategoryType)) {
            throw new Error(`Invalid category for Replicate. Supported categories are: ${ReplicateService.CATEGORIES.join(", ")}`);
        } else if (platform === "falAI" && !FalAIService.CATEGORIES.includes(category as FalAICategoryType)) {
            throw new Error(`Invalid category for Fal.AI. Supported categories are: ${FalAIService.CATEGORIES.join(", ")}`);
        }
        return platform === "replicate" ? 'upper_body' : 'auto';
    }

    /**
     * Common webhook handler logic for both Replicate and FalAI
     */
    private static async handleWebhookCommon(
        req: Request,
        res: Response,
        options: {
            platform: 'replicate' | 'falAI';
            predictionIdField: string;
            parseWebhookData: (webhookData: any) => {
                predictionId: string;
                status: string;
                output?: any;
                payload?: any;
                error?: string;
            };
            processStatusUpdate: (status: string, output?: any, payload?: any, error?: string) => {
                status: Status;
                resultUrl?: string;
                error?: string;
                progress: number;
            };
        }
    ): Promise<void> {
        try {
            const webhookData = req.body;
            console.log(`Received ${options.platform} webhook data:`, JSON.stringify(webhookData, null, 2));

            const { predictionId, status, output, payload, error } = options.parseWebhookData(webhookData);

            if (!predictionId || !status) {
                console.error(`Invalid ${options.platform} webhook data:`, webhookData);
                res.status(400).json({ error: 'Invalid webhook data' });
                return;
            }

            // Find try-on request by prediction ID
            const tryOnRequest = await TryOnService.getTryOnRequestByPredictionId(predictionId);

            if (!tryOnRequest) {
                console.error(`Try-on request not found for ${options.platform} prediction ID: ${predictionId}`);
                res.status(404).json({ error: 'Try-on request not found' });
                return;
            }

            // Process status update based on platform-specific logic
            const updateData = options.processStatusUpdate(status, output, payload, error);

            // Update Firestore document (this triggers real-time listeners)
            await TryOnService.updateTryOnRequest(tryOnRequest.id!, updateData);

            // Send FCM notification for completed or failed status
            if (updateData.status === 'succeeded' || updateData.status === 'failed') {
                await NotificationService.sendTryOnNotification(
                    tryOnRequest.userId,
                    updateData.status,
                    tryOnRequest.id!,
                    updateData.resultUrl
                );
            }

            res.status(200).json({ received: true });
        } catch (error: any) {
            console.error(`${options.platform} Webhook error:`, error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    /**
     * Handle Replicate webhook for try-on completion
     */
    static async handleReplicateWebhook(req: Request, res: Response): Promise<void> {
        await TryOnController.handleWebhookCommon(req, res, {
            platform: 'replicate',
            predictionIdField: 'id',
            parseWebhookData: (webhookData: ReplicateWebhookPayload) => ({
                predictionId: webhookData.id,
                status: webhookData.status,
                output: webhookData.output,
                error: webhookData.error
            }),
            processStatusUpdate: (status, output, _, error) => {
                if (status === 'succeeded') {
                    const resultUrl = Array.isArray(output) ? output[0] : output;
                    return {
                        status: 'succeeded' as const,
                        resultUrl,
                        progress: 100
                    };
                } else if (status === 'failed') {
                    return {
                        status: 'failed' as const,
                        error: error ?? 'Processing failed',
                        progress: 0
                    };
                } else {
                    return {
                        status: status as 'pending' | 'processing' | 'succeeded' | 'failed',
                        progress: status === 'processing' ? 50 : 0
                    };
                }
            }
        });
    }

    /**
     * Handle FalAI webhook for try-on completion
     */
    static async handleFalAIWebhook(req: Request, res: Response): Promise<void> {
        await TryOnController.handleWebhookCommon(req, res, {
            platform: 'falAI',
            predictionIdField: 'request_id',
            parseWebhookData: (webhookData: any) => ({
                predictionId: webhookData.request_id,
                status: webhookData.status,
                payload: webhookData.payload,
                error: webhookData.error
            }),
            processStatusUpdate: (status, _, payload, error) => {
                if (status === 'OK') {
                    const resultUrl = payload?.images?.[0]?.url;
                    return {
                        status: 'succeeded' as const,
                        resultUrl,
                        progress: 100
                    };
                } else if (status === 'ERROR') {
                    return {
                        status: 'failed' as const,
                        error: error ?? 'FalAI processing failed',
                        progress: 0
                    };
                } else if (status === 'in_progress' || status === 'processing') {
                    return {
                        status: 'processing' as const,
                        progress: 50
                    };
                } else {
                    return {
                        status: status as Status,
                        progress: 0
                    };
                }
            }
        });
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