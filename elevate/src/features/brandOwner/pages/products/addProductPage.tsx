import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import ProductForm from "./productsForm";

const AddProductPage = () => {
  const navigate = useNavigate();

  // React Query mutation for creating product
  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      // TODO: Replace with actual API call
      console.log("Creating product:", productData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful response
      return { id: Date.now(), ...productData };
    },
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      navigate("/admin/products");
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });

  const handleCancel = () => {
    navigate("/products");
  };

  const handleSuccess = () => {
    navigate("/products");
  };

  return (
    <ProductForm
      mode="add"
      productData={null}
      mutationFn={createProductMutation.mutateAsync}
      isSubmitting={createProductMutation.isLoading}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default AddProductPage;
