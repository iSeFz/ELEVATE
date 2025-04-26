import { ProductVariant } from '../../types/models/product.js';

export const checkMissingProductVariantData = (productVariants: any) => {
    const currentProductVariant = productVariants as ProductVariant[];
    let validData = true;
    currentProductVariant.forEach((variant) => {
        if (variant.price == null || variant.size == null ||
            variant.stock == null || variant.colors == null ||
            variant.images == null || variant.discount == null) {
            validData = false;
        } 
    })
    return validData;
};