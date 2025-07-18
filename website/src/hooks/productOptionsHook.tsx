import { useQuery } from "@tanstack/react-query";
import { getProductCategories, getProductDepartments, getProductSizes } from "../api/endpoints";

interface ProductData {
    categories: string[];
    departments: string[];
    sizes: string[];
}

export function useProductOptions(): ProductData {
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getProductCategories,
    });
    const { data: departments } = useQuery({
        queryKey: ["departments"],
        queryFn: getProductDepartments,
    });
    const { data: sizes } = useQuery({
        queryKey: ["sizes"],
        queryFn: getProductSizes,
    });

    return {
        categories: categories || [],
        departments: departments || [],
        sizes: sizes || [],
    };
}
