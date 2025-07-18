import React from "react";
import { Container, Grid2 } from "@mui/material";
import ProductCard from "../components/productCard";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../../../../api/endpoints";
import { useOrders } from "../../../../../hooks/ordersHook";

const Orders: React.FC = () => {
  const { products } = useOrders();

  return (
    <Container padding={2} marginLeft={2}>
      <Grid2 container spacing={1}>
        {products.map((product, index) => (
          <Grid2 item key={index}>
            <ProductCard product={product} isOrder={true} />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
};

export default Orders;
