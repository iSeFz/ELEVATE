import { useQuery } from "@tanstack/react-query";
import { getBrandData } from "../api/endpoints";

interface BrandData {
  brandName: string;
  storyDescription: string;
  imageURL: string;
  phoneNumbers: string[];
  industry: string;
  rating: number;
  addresses: {
    building: number;
    city: string;
    postalCode: number;
    street: string;
    latitiude: number;
    longitude: number;
  }[];
  websites: {
    type: string;
    url: string;
  }[];
  subscription: {
    plan: string;
    price: number;
    startDate: {
      _seconds: number;
      _nanoseconds: number;
    };
    endDate: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}

export const useBrand = () => {
  const { data, isLoading, error, refetch } = useQuery<BrandData>({
    queryKey: ["brand"],
    queryFn: getBrandData,
  });

  return {
    brandData: data || null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
};
