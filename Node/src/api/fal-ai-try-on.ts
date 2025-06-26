import { fal } from "@fal-ai/client";

fal.config({
    credentials: "YOUR_FAL_KEY"
});

export const tryOn = async (modelImg: string, garmentImg: string) => {
    try {
        const result = await fal.subscribe("fal-ai/fashn/tryon/v1.5", {
            input: {
                model_image: modelImg,
                garment_image: garmentImg,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });
        return result.data.images[0].url;
    } catch (error) {
        console.error("Error during try-on:", error);
        throw error;
    }
}
