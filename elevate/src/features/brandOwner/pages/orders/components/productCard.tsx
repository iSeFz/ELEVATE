import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import { capitalizeProductName } from "../../../../../services/convertProduct";

interface ProductData {
  id: string;
  productName: string;
  variants: Array<{
    images: string[];
  }>;
  reviewSummary?: {
    averageRating: number;
    totalReviews: number;
  };
}

interface ProductCardProps {
  product: ProductData;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isOrder}) => {
  if (!product) {
    return <div>No product data available.</div>;
  }

  const { productName, totalQuantity, productImage, refundStats } = product;
  const mainImage = productImage || "";

  return (
    <>
      <Card sx={{ margin: 2, boxShadow: 3, height: 320, width: 310 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <Box>
              <Typography
                gutterBottom
                variant="h6"
                fontWeight="bold"
                component="div"
              >
                {capitalizeProductName(productName)}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={"bold"}
                color="text.secondary"
                mt={1}
              >
                {isOrder
                  ? totalQuantity
                    ? `${totalQuantity} orders`
                    : "No orders"
                  : totalQuantity
                    ? `${refundStats.pending} refunds`
                    : "No refunds"}
              </Typography>
              <Box marginTop={2}>
                <CardMedia component="img" image={mainImage} alt={name} />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductCard;