import { fal } from "@fal-ai/client";
import { FalAICategoryType } from "../config/try-on-model.js";

export const CATEGORIES: FalAICategoryType[] = ["tops", "bottoms", "one-pieces", "auto"];

// https://fal.ai/models/fal-ai/kling/v1-5/kolors-virtual-try-on/api
export const startTryOnPrediction = async (
    humanImage: string,
    productImage: string,
    category?: FalAICategoryType,
    webhookUrl?: string
) => {
    const { request_id } = await fal.queue.submit("fal-ai/kling/v1-5/kolors-virtual-try-on", {
        input: {
            human_image_url: humanImage,
            garment_image_url: productImage,
        },
        webhookUrl
    });

    return { id: request_id }
}
