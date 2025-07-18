import { getProductsData } from "../api/endpoints";
import { useQuery } from "@tanstack/react-query";

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
  category: string;
  department: string[];
  description: string;
  material: string;
  name: string;
  reviewSummary: ReviewSummary;
  variants: ProductVariant[];
  id?: string;
}

interface UseProductsResult {
  products: ProductData[];
  loading: boolean;
  error: string | null;
}

export function useProducts(page: number): UseProductsResult {
  const { data, isLoading, error } = useQuery<ProductData[]>({
    queryKey: ["products", page],
    queryFn: () => getProductsData(page),
  });

  return {
    products: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
