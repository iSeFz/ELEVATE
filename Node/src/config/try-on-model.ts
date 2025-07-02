export type ReplicateCategoryType = 'upper_body' | 'lower_body' | 'dresses';

export type FalAICategoryType = 'tops' | 'bottoms' | 'one-pieces' | 'auto';

export type CategoryType = ReplicateCategoryType | FalAICategoryType;

export interface TryOnRequest {
    id?: string;
    userId: string;
    predictionId?: string;
    status: 'pending' | 'processing' | 'succeeded' | 'failed';
    productImg: string;
    personImg: string;
    category: ReplicateCategoryType | FalAICategoryType;
    resultUrl: string;
    error?: string;
    progress: number;
    createdAt: Date;
    updatedAt?: Date;
    webhookUrl?: string;
}

export interface TryOnResponse {
    id: string;
    predictionId?: string;
    status: string;
    message: string;
    progress?: number;
    resultUrl?: string;
}

export interface ReplicateWebhookPayload {
    id: string;
    status: 'succeeded' | 'failed' | 'canceled';
    output?: string | string[];
    error?: string;
    logs?: string;
}

export const CATEGORIES: CategoryType[]
    = [
        'upper_body',
        'lower_body',
        'dresses',
        'tops',
        'bottoms',
        'one-pieces',
        'auto'
    ]