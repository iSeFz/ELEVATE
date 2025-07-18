import Replicate from "replicate";
import { ReplicateCategoryType } from "../config/try-on-model.js";

export class ReplicateService {
    public static readonly CATEGORIES: ReplicateCategoryType[] = ["upper_body", "lower_body", "dresses"];
    private static readonly replicate = new Replicate();
    private static readonly MODEL_VERSION = "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985";

    /**
     * Start virtual try-on prediction with webhook
     */
    static async startTryOnPrediction(
        humanImage: string,
        productImage: string,
        category: ReplicateCategoryType,
        webhookUrl?: string
    ): Promise<{ id: string; status: string; urls: any }> {
        try {
            if (!ReplicateService.CATEGORIES.includes(category)) {
                throw new Error(`Invalid category. Supported categories are: ${ReplicateService.CATEGORIES.join(", ")}`);
            }

            const input = {
                crop: true,
                seed: 42,
                steps: 30,
                force_dc: false,
                mask_only: false,
                garm_img: productImage,
                human_img: humanImage,
                garment_des: "Clothes",
                category: category,
            };

            const options: any = {
                version: this.MODEL_VERSION,
                input
            };

            if (webhookUrl) {
                options.webhook = webhookUrl;
                options.webhook_events_filter = ["completed"];
            }

            const prediction = await this.replicate.predictions.create(options);

            return {
                id: prediction.id,
                status: prediction.status,
                urls: prediction.urls
            };
        } catch (error: any) {
            console.error("Error starting Replicate prediction:", error);
            throw new Error(`Failed to start try-on prediction: ${error.message}`);
        }
    }

    /**
     * Get prediction status
     */
    static async getPredictionStatus(predictionId: string): Promise<any> {
        try {
            const prediction = await this.replicate.predictions.get(predictionId);
            return prediction;
        } catch (error: any) {
            console.error("Error getting prediction status:", error);
            throw new Error(`Failed to get prediction status: ${error.message}`);
        }
    }

    /**
     * Cancel prediction
     */
    static async cancelPrediction(predictionId: string): Promise<void> {
        try {
            await this.replicate.predictions.cancel(predictionId);
        } catch (error: any) {
            console.error("Error canceling prediction:", error);
            throw new Error(`Failed to cancel prediction: ${error.message}`);
        }
    }
}
