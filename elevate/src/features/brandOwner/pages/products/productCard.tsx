// src/components/ProductCard.tsx
import React from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { StyledButton } from "../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../components/StyledSmallSvgIcon";
import { useNavigate } from "react-router";

interface ProductData {
  id: string;
  name: string;
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

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  if (!product) {
    return <div>No product data available.</div>;
  }
  const { id, name, variants, reviewSummary } = product;
  const mainImage = variants?.[0]?.images?.[0] || "";
  const navigate = useNavigate();

  return (
    <Card sx={{ margin: 2, boxShadow: 3, height: 320, width: 345 }}>
      <CardContent>
        <Box display="flex" gap={2}>
          <Box>
            <Typography
              gutterBottom
              variant="h6"
              fontWeight="bold"
              component="div"
            >
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {reviewSummary
                ? `⭐ ${reviewSummary.averageRating} (${reviewSummary.totalReviews} reviews)`
                : "No reviews"}
            </Typography>
            <Box marginTop={2}>
              <CardMedia component="img" image={mainImage} alt={name} />
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <StyledButton variant="outlined" onClick={() => navigate("/products/edit/" + id)}>
              <StyledSmallSvgIcon>
                <image href="/icons/Edit.svg" width="100%" height="100%" />
              </StyledSmallSvgIcon>
              &nbsp;Edit
            </StyledButton>
            <StyledButton variant="outlined">
              <StyledSmallSvgIcon>
                <image href="/icons/Delete.svg" width="100%" height="100%" />
              </StyledSmallSvgIcon>
              &nbsp;Delete
            </StyledButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
