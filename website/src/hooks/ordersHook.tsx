import { useQuery } from "@tanstack/react-query";
import { getOrders, OrderData } from "../api/endpoints";

export function useOrders(): OrderData {
  const { data, isLoading, error } = useQuery<OrderData>({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  return {
    products: data?.products || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
