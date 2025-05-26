import axios from "axios";

declare module "axios" {
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
            "/user/auth/refresh-token",
            { refreshToken },
            { skipAuth: true }
          );
          const { accessToken } = response.data;

          localStorage.setItem("accessToken", accessToken);

          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          isRefreshing = false;
          return axios(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("accessToken");
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

interface UserData {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    role: string;
    brandName: string;
    firstName: string;
    lastName: string;
    username: string;
    brandImageURL: string;
  };
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

const loginRequest = async (data: LoginData): Promise<UserData> => {
  const response = await axios.post("/brand-owners/login", data, {
    skipAuth: true,
  });
  return response.data.data;
};

const getBrandData = async (): Promise<BrandData> => {
  const response = await axios.get("/brands/me");
  return response.data.data;
};

const getProductsData = async (): Promise<ProductData[]> => {
  const response = await axios.get(`/products`);
  return response.data.data.products;
};

export { loginRequest, getBrandData, getProductsData };
