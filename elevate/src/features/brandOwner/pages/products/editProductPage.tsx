import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, CircularProgress, Alert } from "@mui/material";
import ProductForm from "./productsForm";
import { editProduct, getProduct } from "../../../../api/endpoints";

const EditProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });

  const editProductMutation = useMutation({
    mutationFn: async (productData) => editProduct(productData),
    onSuccess: (data) => {
      console.log("Product updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      navigate("/products"); // or "/admin/products" - be consistent
    },
    onError: (error) => {
      console.error("Error updating product:", error);
    },
  });

  const handleCancel = () => {
    navigate("/products");
  };


  // Loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load product data. Please try again.
        </Alert>
      </Box>
    );
  }

  // No data found
  if (!productData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Product not found.</Alert>
      </Box>
    );
  }

  return (
    <ProductForm
      mode="edit"
      productData={productData}
      mutationFn={editProductMutation.mutateAsync}
      isSubmitting={editProductMutation.isPending}
      onCancel={handleCancel}
    />
  );
};

export default EditProductPage;
