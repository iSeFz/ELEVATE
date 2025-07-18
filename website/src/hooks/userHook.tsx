import { useQuery } from "@tanstack/react-query";
import { getBrandOwnerData } from "../api/endpoints";

interface UserData {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  username: string;
  imageURL: string;
}

export const useUser = () => {
  const { data, isLoading, error, refetch } = useQuery<UserData>({
    queryKey: ["user"],
    queryFn: getBrandOwnerData,
  });

  return {
    userData: data || null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
};
