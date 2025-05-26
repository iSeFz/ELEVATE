// src/pages/ProductPage.tsx
import React from "react";
import { Container, Grid2 } from "@mui/material";
import ProductCard from "./productCard";
import { StyledButton } from "../../../../components/StyledButton";
import { AddCircleOutline } from "@mui/icons-material";
import { useProducts } from "./producthook";
// import ProductCard from '../components/ProductCard';


const Product: React.FC = () => {
  const { products } = useProducts();
  return (
    <Container padding={2} marginLeft={2}>
      <StyledButton variant="outlined" sx={{ marginBottom: 4, marginLeft: 3 }}>
        <AddCircleOutline sx={{ fontSize: 16 }} />
        &nbsp;Add New Product
      </StyledButton>
      <Grid2 container spacing={1}>
        {products.map((product, index) => (
          <Grid2 item key={index}>
            <ProductCard
              title={product.name}
              image={product.variants[0]?.image || ""}
              product={product}
            />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
};

export default Product;
