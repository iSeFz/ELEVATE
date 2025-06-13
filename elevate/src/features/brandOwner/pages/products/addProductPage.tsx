import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import ProductForm from "./productsForm";
import { addProduct } from "../../../../api/endpoints";

const AddProductPage = () => {
  const navigate = useNavigate();

  // React Query mutation for creating product
  const createProductMutation = useMutation({
    mutationFn: async (productData) => addProduct(productData),
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      navigate("/products");
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });

  const handleCancel = () => {
    navigate("/products");
  };

  return (
    <ProductForm
      mode="add"
      productData={null}
      mutationFn={createProductMutation.mutateAsync}
      isSubmitting={createProductMutation.isLoading}
      onCancel={handleCancel}
    />
  );
};

export default AddProductPage;
