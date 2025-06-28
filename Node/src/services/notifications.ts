import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { TryOnRequest } from '../config/try-on-model.js';

export class NotificationService {
    /**
     * Send FCM notification for try-on status update
     */
    static async sendTryOnNotification(
        userId: string,
        status: string,
        requestId: string,
        resultUrl?: string
    ): Promise<void> {
        try {
            // Get user's FCM token from Firestore
            const userDoc = await admin.firestore().collection('users').doc(userId).get();
            const fcmToken = userDoc.data()?.fcmToken;

            if (!fcmToken) {
                return;
            }

            const { title, body } = this.getTryOnNotificationContent(status);

            const message = {
                token: fcmToken,
                notification: { title, body },
                data: {
                    type: 'try_on_update',
                    requestId: requestId,
                    status: status,
                    resultUrl: resultUrl || '',
                    userId: userId
                },
                android: {
                    notification: {
                        icon: 'ic_notification',
                        color: '#FF6B35',
                        sound: 'default'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                }
            };

            await admin.messaging().send(message);

        } catch (error: any) {
            console.error("Error sending FCM notification:", error);
        }
    }

    /**
     * Get notification content based on status
     */
    private static getTryOnNotificationContent(status: string): { title: string; body: string } {
        switch (status) {
            case 'succeeded':
                return {
                    title: "Try-On Complete! 🎉",
                    body: "Your virtual try-on is ready to view!"
                };
            case 'failed':
                return {
                    title: "Try-On Failed",
                    body: "Something went wrong with your try-on. Please try again."
                };
            case 'processing':
                return {
                    title: "Try-On In Progress",
                    body: "Your virtual try-on is being processed..."
                };
            default:
                return {
                    title: "Try-On Update",
                    body: "Your try-on status has been updated."
                };
        }
    }

    /**
     * Save FCM token for user
     */
    static async saveFCMToken(userId: string, fcmToken: string): Promise<void> {
        try {
            await admin.firestore()
                .collection('users')
                .doc(userId)
                .update({ fcmToken });
        } catch (error: any) {
            console.error("Error saving FCM token:", error);
            throw new Error(`Failed to save FCM token: ${error.message}`);
        }
    }
}