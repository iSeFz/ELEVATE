import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Box, CircularProgress, Alert } from "@mui/material";
import ProductForm from "./productsForm";

const EditProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // React Query for fetching product data
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      console.log("Fetching product:", productId);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate product data - replace with actual API response
      return {
        id: productId,
        name: "Sample Product",
        description: "This is a sample product description",
        material: "Cotton",
        category: "Hoodies",
        department: ["Men", "Women"],
        variants: [
          {
            size: "M",
            colors: ["Black", "White"],
            price: 599,
            stock: 50,
            discount: 10,
            images: [],
          },
          {
            size: "L",
            colors: ["Black"],
            price: 599,
            stock: 30,
            discount: 10,
            images: [],
          },
        ],
      };
    },
    enabled: !!productId,
  });

  // React Query mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: async (updatedData) => {
      // TODO: Replace with actual API call
      console.log("Updating product:", productId, updatedData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful update
      return { id: productId, ...updatedData };
    },
    onSuccess: (data) => {
      console.log("Product updated successfully:", data);
      navigate("/admin/products");
    },
    onError: (error) => {
      console.error("Error updating product:", error);
    },
  });

  const handleCancel = () => {
    navigate("/products");
  };

  const handleSuccess = () => {
    navigate("/products");
    // Additional success logic if needed
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
      mutationFn={updateProductMutation.mutateAsync}
      isSubmitting={updateProductMutation.isLoading}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default EditProductPage;
