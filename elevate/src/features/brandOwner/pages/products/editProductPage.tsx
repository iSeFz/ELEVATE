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

  const getChangedFields = (originalData: any, newData: any) => {
    const changes: any = {};
    
    changes.id = productId;
    
    Object.keys(newData).forEach(key => {
      if (JSON.stringify(originalData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = newData[key];
      }
    });
    
    return changes;
  };

  const editProductMutation = useMutation({
    mutationFn: async (newProductData) => {
      const changedData = getChangedFields(productData, newProductData);
      
      if (Object.keys(changedData).length <= 1) {
        console.log("No changes detected");
        return productData;
      }
      
      console.log("Sending changed fields:", changedData);
      return editProduct(changedData);
    },
    onSuccess: (data) => {
      console.log("Product updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      navigate("/products");
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