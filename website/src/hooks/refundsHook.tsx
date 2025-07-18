import { useQuery } from "@tanstack/react-query";
import {getRefunds, RefundData } from "../api/endpoints";

export function useRefunds(): RefundData {
  const { data, isLoading, error } = useQuery<RefundData>({
    queryKey: ["refunds"],
    queryFn: () => getRefunds(),
  });

  return {
    products: data?.products || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
