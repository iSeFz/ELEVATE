import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

interface BrandContextType {
  brandData: BrandData | null;
  setBrandData: (data: BrandData | null) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [brandData, setBrandDataState] = useState<BrandData | null>(() => {
    const stored = localStorage.getItem("brandData");
    return stored ? JSON.parse(stored) : null;
  });

  const setBrandData = (data: BrandData | null) => {
    setBrandDataState(data);
    if (data) {
      localStorage.setItem("brandData", JSON.stringify(data));
    } else {
      localStorage.removeItem("brandData");
    }
  };

  useEffect(() => {
    if (brandData) {
      localStorage.setItem("brandData", JSON.stringify(brandData));
    }
  }, [brandData]);

  return (
    <BrandContext.Provider value={{ brandData, setBrandData }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
};
