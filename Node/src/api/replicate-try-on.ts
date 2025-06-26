import Replicate from "replicate";
const replicate = new Replicate();

export const CATEGORIES = ["upper_body", "lower_body", "dresses"];

export async function tryOn(humanImage: string, productImage: string, category = "upper_body") {
    try {
        if (!CATEGORIES.includes(category)) {
            throw new Error(`Invalid category. Supported categories are: ${CATEGORIES.join(", ")}`);
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
        const output: any = await replicate.run("cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985", { input });
        return output.url();
    } catch (error: any) {
        console.error("Error in Replicate Try-On:", error);
        throw new Error(`Failed to run Replicate Try-On: ${error.message}`);
    }
}
