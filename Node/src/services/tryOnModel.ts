import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { FalAICategoryType, ReplicateCategoryType, TryOnRequest } from '../config/try-on-model.js';
import { v4 as uuidv4 } from 'uuid';

export class TryOnService {
    private static readonly collection = admin.firestore().collection(FIREBASE_COLLECTIONS['tryOnRequests']);
    private static readonly realtimeDb = admin.database();

    /**
     * Create a new try-on request document in Firestore
     */
    static async createTryOnRequest(
        userId: string,
        productImg: string,
        personImg: string,
        category: ReplicateCategoryType | FalAICategoryType,
        webhookUrl?: string
    ): Promise<TryOnRequest> {
        try {
            const requestId = uuidv4();
            const tryOnRequest: TryOnRequest = {
                userId,
                status: 'pending',
                productImg,
                resultUrl: '',
                personImg,
                category,
                progress: 0,
                createdAt: new Date(),
                webhookUrl
            };

            await this.collection.doc(requestId).set({
                ...tryOnRequest,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Initialize in Realtime Database for live tracking
            await this.updateRealtimeStatus(userId, {
                requestId: requestId,
                status: 'pending',
                progress: 0,
                updatedAt: new Date().toISOString()
            });

            return { ...tryOnRequest, id: requestId };
        } catch (error: any) {
            console.error('Error creating try-on request:', error);
            throw new Error(`Failed to create try-on request: ${error.message}`);
        }
    }

    /**
     * Update try-on request status and details
     */
    static async updateTryOnRequest(
        requestId: string,
        updates: Partial<TryOnRequest>
    ): Promise<void> {
        try {
            const updateData = {
                ...updates,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await this.collection.doc(requestId).update(updateData);

            // Get the full document to sync with Realtime Database
            const doc = await this.collection.doc(requestId).get();
            const tryOnData = { id: doc.id, ...doc.data() } as TryOnRequest;

            // Update Realtime Database for live tracking (latest status only)
            await this.updateRealtimeStatus(tryOnData.userId, {
                requestId: requestId,
                predictionId: tryOnData.predictionId ?? "",
                status: tryOnData.status ?? "pending",
                progress: tryOnData.progress ?? 0,
                resultUrl: tryOnData.resultUrl ?? "",
                error: tryOnData.error ?? "",
                updatedAt: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('Error updating try-on request:', error);
            throw new Error(`Failed to update try-on request: ${error.message}`);
        }
    }


    /**
     * Update user's latest try-on status in Realtime Database
     */
    private static async updateRealtimeStatus(
        userId: string,
        statusData: {
            requestId: string;
            predictionId?: string;
            status: string;
            progress: number;
            resultUrl?: string;
            error?: string;
            updatedAt: string;
        }
    ): Promise<void> {
        try {
            const userStatusRef = this.realtimeDb.ref(`userTryOnStatus/${userId}/latest`);
            await userStatusRef.set(statusData);
        } catch (error: any) {
            console.error('Error updating realtime status:', error);
        }
    }

    /**
     * Get try-on request by ID
     */
    static async getTryOnRequest(requestId: string): Promise<TryOnRequest | null> {
        try {
            const doc = await this.collection.doc(requestId).get();

            if (!doc.exists) {
                return null;
            }

            return { id: doc.id, ...doc.data() } as TryOnRequest;
        } catch (error: any) {
            console.error('Error getting try-on request:', error);
            throw new Error(`Failed to get try-on request: ${error.message}`);
        }
    }

    /**
     * Get try-on request by prediction ID
     */
    static async getTryOnRequestByPredictionId(predictionId: string): Promise<TryOnRequest | null> {
        try {
            const snapshot = await this.collection
                .where('predictionId', '==', predictionId)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as TryOnRequest;
        } catch (error: any) {
            console.error('Error getting try-on request by prediction ID:', error);
            throw new Error(`Failed to get try-on request: ${error.message}`);
        }
    }

    /**
     * Get user's try-on history with pagination
     */
    static async getUserTryOnHistory(
        userId: string,
        limit: number = 10,
        lastDoc?: string
    ): Promise<TryOnRequest[]> {
        try {
            let query = this.collection
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit);

            if (lastDoc) {
                const lastDocRef = await this.collection.doc(lastDoc).get();
                query = query.startAfter(lastDocRef);
            }

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TryOnRequest[];
        } catch (error: any) {
            console.error('Error getting user try-on history:', error);
            throw new Error(`Failed to get try-on history: ${error.message}`);
        }
    }

    /**
     * Delete try-on request
     */
    static async deleteTryOnRequest(requestId: string): Promise<void> {
        try {
            await this.collection.doc(requestId).delete();
        } catch (error: any) {
            console.error('Error deleting try-on request:', error);
            throw new Error(`Failed to delete try-on request: ${error.message}`);
        }
    }

    /**
 * Clear user's realtime status (optional - when try-on is viewed/dismissed)
 */
    static async clearRealtimeStatus(userId: string): Promise<void> {
        try {
            const userStatusRef = this.realtimeDb.ref(`userTryOnStatus/${userId}/latest`);
            await userStatusRef.remove();
        } catch (error: any) {
            console.error('Error clearing realtime status:', error);
        }
    }
}