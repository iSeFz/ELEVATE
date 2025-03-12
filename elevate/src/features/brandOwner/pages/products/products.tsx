// src/pages/ProductPage.tsx
import React from "react";
import { Container, Grid2 } from "@mui/material";
import ProductCard from "./productCard";
import { StyledButton } from "../../../../components/StyledButton";
import { AddCircleOutline } from "@mui/icons-material";
// import ProductCard from '../components/ProductCard';

const products = [
  {
    title: "Gray Quarter Zip",
    description: "Basic gray quarter zip",
    image: "/images/GrayQuartetZip.png",
  },
  {
    title: "Brown Jacket",
    description: "Basic brown jacket",
    image: "/images/BrownJacket.png",
  },
  {
    title: "Olive Regular Fit Tee",
    description: "Regular fit t-shirt",
    image: "/images/OliverRegularFit.png",
  },
  {
    title: "Pink Relaxed Fit Tee",
    description: "Relaxed fit t-shirt",
    image: "/images/RelaxedFitTee.png",
  },
  {
    title: "Black Sweatpants",
    description: "Basic black sweatpants",
    image: "/images/BlackSweatPants.png",
  },
];

const Product: React.FC = () => {
  return (
    <Container padding={2} marginLeft={2}>
      <StyledButton variant="outlined" sx={{ marginBottom: 4, marginLeft: 3 }}>
        <AddCircleOutline sx={{ fontSize: 16 }} />
        &nbsp;Add New Product
      </StyledButton>
      <Grid2 container spacing={1}>
        {products.map((product, index) => (
          <Grid2 item key={index}>
            <ProductCard {...product} />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
};

export default Product;
