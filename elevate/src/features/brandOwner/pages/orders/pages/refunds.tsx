import React from "react";
import { Container, Grid2 } from "@mui/material";
import ProductCard from "../components/productCard";
import { useRefunds } from "../../../../../hooks/refundsHook";

const Orders: React.FC = () => {
  const { products } = useRefunds();

  return (
    <Container padding={2} marginLeft={2}>
      <Grid2 container spacing={1}>
        {products
          .filter((product) => product.refundStats?.pending !== 0)
          .map((product, index) => (
            <Grid2 item key={index}>
              <ProductCard product={product} isOrder={false} />
            </Grid2>
          ))}
      </Grid2>
    </Container>
  );
};

export default Orders;
