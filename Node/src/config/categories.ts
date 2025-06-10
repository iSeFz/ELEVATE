export const CATEGORIES: string[] = [
    "Tops - T-Shirts", "Tops - Shirts", "Tops - Blouses", "Tops - Crop Tops", "Tops - Tank Tops",
    "Tops - Sweaters", "Tops - Hoodies", "Tops - Sweatshirts", "Tops - Jackets", "Tops - Coats",
    "Bottoms - Jeans", "Bottoms - Pants / Trousers", "Bottoms - Leggings", "Bottoms - Shorts", "Bottoms - Skirts",
    "Dresses & One-Pieces - Dresses", "Dresses & One-Pieces - Jumpsuits", "Dresses & One-Pieces - Abayas / Kaftans",
    "Sets",
    "Activewear - Gym Tops", "Activewear - Gym Leggings", "Activewear - Tracksuits"
];

// Helper to get all categories (future-proof for adding metadata)
export function getAllCategoriesDetails(): string[] {
    return CATEGORIES;
}
