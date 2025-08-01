// src/components/ProductCard.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  StyledButton,
  BlackStyledButton,
} from "../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../components/StyledSmallSvgIcon";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../../../../api/endpoints"; // Adjust import path
import { useSnackbar } from "notistack";
import { capitalizeProductName } from "../../../../services/convertProduct";

interface ProductData {
  id: string;
  name: string;
  variants: Array<{
    images: string[];
  }>;
  reviewSummary?: {
    averageRating: number;
    totalReviews: number;
  };
}

interface ProductCardProps {
  product: ProductData;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!product) {
    return <div>No product data available.</div>;
  }

  const { id, name, variants, reviewSummary } = product;
  const mainImage = variants?.[0]?.images?.[0] || "";

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });

      enqueueSnackbar("Product deleted successfully", { variant: "success" });

      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      enqueueSnackbar("Failed to delete product. Please try again.", {
        variant: "error",
      });

      setDeleteDialogOpen(false);
    },
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <Card sx={{ margin: 2, boxShadow: 3, height: 320, width: 345 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <Box>
              <Typography
                gutterBottom
                variant="h6"
                fontWeight="bold"
                component="div"
              >
                {capitalizeProductName(name)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {reviewSummary
                  ? `⭐ ${reviewSummary.averageRating} (${reviewSummary.totalReviews} reviews)`
                  : "No reviews"}
              </Typography>
              <Box marginTop={2}>
                <CardMedia component="img" image={mainImage} alt={name} />
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <StyledButton
                variant="outlined"
                onClick={() => navigate("/products/edit/" + id)}
              >
                <StyledSmallSvgIcon>
                  <image href="/icons/Edit.svg" width="100%" height="100%" />
                </StyledSmallSvgIcon>
                &nbsp;Edit
              </StyledButton>
              <StyledButton variant="outlined" onClick={handleDeleteClick}>
                <StyledSmallSvgIcon>
                  <image href="/icons/Delete.svg" width="100%" height="100%" />
                </StyledSmallSvgIcon>
                &nbsp;Delete
              </StyledButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{name}"?</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All product data including variants
            will be permanently removed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <StyledButton
            onClick={handleCloseDialog}
            disabled={deleteMutation.isPending}
            variant="outlined"
          >
            Cancel
          </StyledButton>
          <BlackStyledButton
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            variant="contained"
            color="error"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </BlackStyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
