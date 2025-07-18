import React, { useState } from "react";
import { Container, Grid2, Box, Pagination, Typography } from "@mui/material";
import ProductCard from "./productCard";
import { StyledButton } from "../../../../components/StyledButton";
import { AddCircleOutline } from "@mui/icons-material";
import { useProducts } from "../../../../hooks/producthook";
import { useNavigate } from "react-router";
import { useBrand } from "../../../../hooks/brandHook";

const Product: React.FC = () => {
  const {brandData} = useBrand();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const { products } = useProducts(page);
  const itemsPerPage = products.length;

  const totalPages = Math.ceil(brandData?.productCount / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container padding={2} marginLeft={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <StyledButton
          variant="outlined"
          sx={{ marginLeft: 3 }}
          onClick={() => navigate("/products/add")}
        >
          <AddCircleOutline sx={{ fontSize: 16 }} />
          &nbsp;Add New Product
        </StyledButton>

        <Typography variant="body2" color="text.secondary" sx={{ mr: 3 }}>
          Showing {startIndex + 1}-{Math.min(endIndex, brandData?.productCount)}{" "}
          of {brandData?.productCount} products
        </Typography>
      </Box>

      <Grid2 container spacing={1}>
        {paginatedProducts.map((product, index) => (
          <Grid2 item key={startIndex + index}>
            <ProductCard product={product} />
          </Grid2>
        ))}
      </Grid2>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default Product;
