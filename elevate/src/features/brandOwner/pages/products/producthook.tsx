import { useEffect, useState } from 'react';
import { getProductsData } from '../../../../api/endpoints';
import { useQuery } from '@tanstack/react-query';

export interface ProductVariant {
    stock: number;
    images: string[];
    discount: number;
    price: number;
    size: string;
    colors: string[];
    id: string;
}

export interface ReviewSummary {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

export interface ProductData {
    brandId: string;
    brandOwnerId: string;
    brandName: string;
    category: string;
    department: string[];
    description: string;
    material: string;
    name: string;
    reviewSummary: ReviewSummary;
    variants: ProductVariant[];
    id: string;
}

interface UseProductsResult {
    products: ProductData[];
    loading: boolean;
    error: string | null;
}

export function useProducts(): UseProductsResult {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorState, setErrorState] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery<ProductData[]>({
        queryKey: ['products'],
        queryFn: getProductsData,
    });

    useEffect(() => {
        if (Array.isArray(data)) {
            setProducts(data);
        } else {
            setProducts([]);
        }
    }, [data]);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    useEffect(() => {
        setErrorState(error ? (error as unknown as Error).message : null);
    }, [error]);

    return { products, loading, error: errorState };
}