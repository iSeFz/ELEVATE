import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

axios.defaults.baseURL = "https://elevate-gp.vercel.app/api/v1/";

axios.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      return config;
    }
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("accessToken");
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        return Promise.reject(error);
      }
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post(
            "/utilities/refresh-token",
            { refreshToken },
            { skipAuth: true }
          );
          const accessToken = response.data.data.accessToken;

          localStorage.setItem("accessToken", accessToken);

          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          isRefreshing = false;
          return axios(originalRequest);
        } catch (refreshError) {
          const queryClient = useQueryClient();
          localStorage.clear();
          queryClient.invalidateQueries();
          console.error("Refresh token expired or invalid.");
          isRefreshing = false;
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

interface LoginData {
  email: string;
  password: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface UserData {
  email?: string;
  role?: string;
  firstName: string;
  lastName: string;
  username: string;
  imageURL: string;
}

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
  productCount: number;
}

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

export interface OrderData {
  products: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalOrders: number;
  }[];
}

export interface RefundData {
  products: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalOrders: number;
    refundStats: {
      pending: number;
      approved: number;
      rejected: number;
    };
  }[];
}

export interface ReviewData {
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

interface StatsData {
  currentMonthStats: {
    totalProductsSold: number;
    totalSales: number;
    topProduct: {
      productId: string;
      productName: string;
      quantitySold: number;
      totalSales: number;
    };
    topProductsSales: {
      productId: string;
      productName: string;
      quantitySold: number;
      totalSales: number;
    }[];
  };
  monthsSales: {
    data: {
      year: number;
      month: number;
      monthName: string;
      totalSales: number;
      totalProductsSold: number;
      ordersCount: number;
    }[];
  };
}

const loginRequest = async (data: LoginData): Promise<Tokens> => {
  const response = await axios.post("/brand-owners/login", data, {
    skipAuth: true,
  });
  return response.data.data;
};

const getBrandData = async (): Promise<BrandData> => {
  const response = await axios.get("/brands/me");
  return response.data.data;
};

const UpdateBrandData = async (data: BrandData): Promise<BrandData> => {
  const response = await axios.put("/brands/me", data);
  return response.data.data;
};


const getBrandOwnerData = async (): Promise<UserData> => {
  const response = await axios.get("/brand-owners/me");
  return response.data.data;
};

const updateBrandOwnerData = async (data: UserData): Promise<void> => {
  const response = await axios.put("/brand-owners/me", data);
  if (response.data.status !== "success") {
    throw new Error("Failed to update brand owner data");
  }
};

const getProductsData = async (page: number): Promise<ProductData[]> => {
  const response = await axios.get(`/brand-owners/me/products`, {params: { page, limit: 9}});
  return response.data.data;
};

const addProduct = async (data: ProductData): Promise<void> => {
  const response = await axios.post(`/brand-owners/me/products`, data);
  if (response.data.status !== 'success') {
    throw new Error("Failed to add product");
  }
};

const editProduct = async (data: ProductData): Promise<void> => {
  const response = await axios.put(`/brand-owners/me/products/` + data.id, data);
  if (response.data.status !== "success") {
    throw new Error("Failed to edit product");
  }
};

const getProduct = async (id: string): Promise<ProductData> => {
  const response = await axios.get(`/products/` + id);
  return response.data.data;
};

const deleteProduct = async (id: string): Promise<ProductData> => {
  const response = await axios.delete(`/brand-owners/me/products/` + id);
  return response.data.data;
};

const getOrders = async (): Promise<OrderData> => {
  const response = await axios.get(`/brand-owners/me/orders/processing-products`);
  return response.data.data;
};

const getRefunds = async (): Promise<RefundData> => {
  const response = await axios.get(`/brand-owners/me/orders/refunded-products`);
  return response.data.data;
};

const getBrandRatings = async (): Promise<ReviewData> => {
  const response = await axios.get(
    `/brand-owners/me/dashboard/reviews-summary`
  );
  return response.data.data;
};

const getBrandStats = async (): Promise<StatsData> => {
  const response = await axios.get(
    `/brand-owners/me/dashboard/months-sales`
  );
  return response.data.data;
};

const getProductCategories = async (): Promise<string[]> => {
  const response = await axios.get(`/products/categories`);
  return response.data.data;
};

const getProductDepartments = async (): Promise<string[]> => {
  const response = await axios.get(`/products/departments`);
  return response.data.data;
};

const getProductSizes = async (): Promise<string[]> => {
  const response = await axios.get(`/products/sizes`);
  return response.data.data;
};

const resetPassword = async (email: string): Promise<void> => {
  const response = await axios.post(`/utilities/send-password-reset`, email);
  if (response.data.status !== 'success') {
    throw new Error("Failed to add product");
  }
};

const confirmResetPassword = async (data: {
  oobCode: "string";
  newPassword: "string";
}): Promise<void> => {
  const response = await axios.post(`/utilities/confirm-password-reset`, data);
  if (response.data.status !== "success") {
    throw new Error("Failed to add product");
  }
};

export {
  loginRequest,
  getBrandData,
  getProductsData,
  getBrandOwnerData,
  updateBrandOwnerData,
  addProduct,
  editProduct,
  getProduct,
  deleteProduct,
  getOrders,
  getRefunds,
  getBrandRatings,
  getBrandStats,
  getProductCategories,
  getProductDepartments,
  getProductSizes,
  UpdateBrandData,
  resetPassword,
  confirmResetPassword
};
