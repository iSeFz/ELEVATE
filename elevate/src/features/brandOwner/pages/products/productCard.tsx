// src/components/ProductCard.tsx
import React from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { StyledButton } from "../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../components/StyledSmallSvgIcon";

interface ProductCardProps {
  title: string;
  description: string;
  image: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  image,
}) => {
  return (
    <Card sx={{ margin: 2, boxShadow: 3, height: 320, width: 345 }}>
      <CardContent>
        <Box display="flex" gap={4}>
          <Box>
            <Typography
              gutterBottom
              variant="h6"
              fontWeight="bold"
              component="div"
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            <Box marginTop={2}>
              <CardMedia component="img" image={image} alt={title} />
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <StyledButton variant="outlined">
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
