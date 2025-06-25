import { useQuery } from "@tanstack/react-query";
import { getBrandRatings, getBrandStats } from "../api/endpoints";

interface StatsData {
  totalProductsSold: number;
  totalSales: number;
  topProduct: {
    productId: string;
    productName: string;
    quantitySold: number;
    totalSales: number;
  };
  topProductsSales: [
    {
      productId: string;
      productName: string;
      quantitySold: number;
      totalSales: number;
    },
  ];
}

interface ReviewData {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface DashboardData {
  stats: StatsData;
  reviews: ReviewData;
}


export function useDashboardData() {
  const { data: stats } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: getBrandStats,
  });

  const { data: reviews } = useQuery<ReviewData>({
    queryKey: ["reviews"],
    queryFn: getBrandRatings,
  });

  return {
    stats: stats || {
      totalProductsSold: 0,
      totalSales: 0,
      topProduct: {
        productId: "",
        productName: "",
        quantitySold: 0,
        totalSales: 0,
      },
      topProductsSales: [],
    },
    reviews: reviews || {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }
    },
  } as DashboardData;
}