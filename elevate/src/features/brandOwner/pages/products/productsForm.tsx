import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  FormHelperText,
  Chip,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import * as yup from "yup";
import { useFormik } from "formik";
import { StyledTypography } from "../../../../components/StyledTypography";
import { StyledTextField } from "../../../../components/StyledTextField";
import { BlackStyledButton, StyledButton } from "../../../../components/StyledButton";
import { StlyedChip } from "../../../../components/StyledChip";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Yup validation schemas
const variantSchema = yup.object({
  size: yup.string().required("Size is required"),
  colors: yup.array().min(1, "At least one color is required"),
  price: yup
    .number()
    .required("Price is required")
    .positive("Price must be positive"),
  stock: yup
    .number()
    .required("Stock is required")
    .min(0, "Stock cannot be negative"),
  discount: yup
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
  images: yup.array(),
});

const productSchema = yup.object({
  name: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  material: yup.string().required("Material is required"),
  category: yup.string().required("Category is required"),
  department: yup.array().min(1, "At least one department is required"),
  variants: yup.array().min(1, "At least one variant is required"),
});

const ProductForm = ({ 
  mode = "add", 
  productData = null,
  mutationFn,
  isSubmitting = false,
  onSuccess,
  onCancel 
}) => {
  const [variantDialog, setVariantDialog] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Main form using Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      material: "",
      category: "",
      department: [],
      variants: [],
    },
    validationSchema: productSchema,
    onSubmit: async (values) => {
      try {
        await mutationFn(values);
        showSnackbar(
          mode === "add" 
            ? "Product created successfully" 
            : "Product updated successfully", 
          "success"
        );
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        showSnackbar("Failed to save product. Please try again.", "error");
      }
    },
  });

  // Variant form using Formik
  const variantFormik = useFormik({
    initialValues: {
      size: "",
      colors: [],
      price: "",
      stock: "",
      discount: 0,
      images: [],
    },
    validationSchema: variantSchema,
    onSubmit: (values) => {
      const updatedVariants = [...formik.values.variants];

      if (editingVariantIndex !== null) {
        updatedVariants[editingVariantIndex] = values;
        showSnackbar("Variant updated successfully", "success");
      } else {
        updatedVariants.push(values);
        showSnackbar("Variant added successfully", "success");
      }

      formik.setFieldValue("variants", updatedVariants);
      closeVariantDialog();
    },
  });

  // Load product data if in edit mode
  useEffect(() => {
    if (mode === "edit" && productData) {
      formik.setValues({
        name: productData.name || "",
        description: productData.description || "",
        material: productData.material || "",
        category: productData.category || "",
        department: productData.department || [],
        variants: productData.variants || [],
      });
    }
  }, [mode, productData]);

  const departments = ["Men", "Women", "Kids", "Unisex"];
  const categories = ["Hoodies", "T-Shirts", "Jackets", "Pants", "Accessories"];
  const availableColors = [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Gray",
    "Navy",
    "Pink",
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const openVariantDialog = (variant = null, index = null) => {
    if (variant) {
      variantFormik.setValues(variant);
      setEditingVariantIndex(index);
    } else {
      variantFormik.resetForm();
      setEditingVariantIndex(null);
    }
    setVariantDialog(true);
  };

  const closeVariantDialog = () => {
    setVariantDialog(false);
    variantFormik.resetForm();
    setEditingVariantIndex(null);
  };

  const deleteVariant = (index) => {
    const updatedVariants = formik.values.variants.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("variants", updatedVariants);
    showSnackbar("Variant deleted", "warning");
  };

  const handleVariantImageUpload = (event) => {
    const files = Array.from(event.target.files);

    // Convert files to base64 or object URLs for preview
    const newImages = files.map((file) => URL.createObjectURL(file));

    variantFormik.setFieldValue("images", [
      ...variantFormik.values.images,
      ...newImages,
    ]);
    showSnackbar(`${files.length} image(s) added`, "success");
  };

  const removeVariantImage = (index) => {
    const updatedImages = variantFormik.values.images.filter(
      (_, i) => i !== index
    );
    variantFormik.setFieldValue("images", updatedImages);
    showSnackbar("Image removed", "info");
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <StyledTypography variant="h5" gutterBottom>
        {mode === "add" ? "Add New Product" : "Edit Product"}
      </StyledTypography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column - Basic Product Info */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <StyledTypography variant="h6" gutterBottom>
                Product Details
              </StyledTypography>

              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />

                <StyledTextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />

                <StyledTextField
                  fullWidth
                  label="Material"
                  name="material"
                  value={formik.values.material}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.material && Boolean(formik.errors.material)
                  }
                  helperText={formik.touched.material && formik.errors.material}
                />

                <FormControl
                  fullWidth
                  error={
                    formik.touched.category && Boolean(formik.errors.category)
                  }
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <FormHelperText>{formik.errors.category}</FormHelperText>
                  )}
                </FormControl>

                <Autocomplete
                  multiple
                  options={departments}
                  value={formik.values.department}
                  onChange={(event, newValue) => {
                    formik.setFieldValue("department", newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Department"
                      error={
                        formik.touched.department &&
                        Boolean(formik.errors.department)
                      }
                      helperText={
                        formik.touched.department && formik.errors.department
                      }
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <StlyedChip label={option} {...getTagProps({ index })} />
                    ))
                  }
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Right Column - Variants */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <StyledTypography variant="h6">
                  Product Variants
                </StyledTypography>
                <BlackStyledButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openVariantDialog()}
                  size="small"
                  type="button"
                >
                  Add Variant
                </BlackStyledButton>
              </Box>

              {formik.touched.variants && formik.errors.variants && (
                <StyledTypography
                  color="error"
                  variant="caption"
                  display="block"
                  sx={{ mb: 2 }}
                >
                  {formik.errors.variants}
                </StyledTypography>
              )}

              {formik.values.variants.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Size</TableCell>
                        <TableCell>Colors</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Images</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formik.values.variants.map((variant, index) => (
                        <TableRow key={index}>
                          <TableCell>{variant.size}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              {variant.colors.map((color, i) => (
                                <Chip key={i} label={color} size="small" />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>{variant.price} EGP</TableCell>
                          <TableCell>{variant.stock}</TableCell>
                          <TableCell>{variant.discount}%</TableCell>
                          <TableCell>{variant.images.length}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => openVariantDialog(variant, index)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteVariant(index)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    border: "1px dashed",
                    borderColor: "grey.300",
                  }}
                >
                  <StyledTypography color="text.secondary">
                    No variants added yet
                  </StyledTypography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <StyledButton
            variant="outlined"
            onClick={handleCancel}
            sx={{ minWidth: 120 }}
            disabled={isSubmitting}
            type="button"
          >
            CANCEL
          </StyledButton>
          <BlackStyledButton
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : mode === "add" ? (
              "ADD PRODUCT"
            ) : (
              "UPDATE PRODUCT"
            )}
          </BlackStyledButton>
        </Box>
      </form>

      {/* Variant Dialog */}
      <Dialog
        open={variantDialog}
        onClose={closeVariantDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={variantFormik.handleSubmit}>
          <DialogTitle>
            {editingVariantIndex !== null ? "Edit Variant" : "Add New Variant"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl
                fullWidth
                error={
                  variantFormik.touched.size &&
                  Boolean(variantFormik.errors.size)
                }
              >
                <InputLabel>Size</InputLabel>
                <Select
                  name="size"
                  value={variantFormik.values.size}
                  onChange={variantFormik.handleChange}
                  onBlur={variantFormik.handleBlur}
                  label="Size"
                >
                  {sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
                {variantFormik.touched.size && variantFormik.errors.size && (
                  <FormHelperText>{variantFormik.errors.size}</FormHelperText>
                )}
              </FormControl>

              <Autocomplete
                multiple
                options={availableColors}
                value={variantFormik.values.colors}
                onChange={(event, newValue) => {
                  variantFormik.setFieldValue("colors", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Colors"
                    error={
                      variantFormik.touched.colors &&
                      Boolean(variantFormik.errors.colors)
                    }
                    helperText={
                      variantFormik.touched.colors &&
                      variantFormik.errors.colors
                    }
                    placeholder="Select colors"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />

              <Box gap={2} justifyContent="space-between" display="flex">
                <Box width="33%">
                  <StyledTextField
                    fullWidth
                    label="Price (EGP)"
                    name="price"
                    type="number"
                    value={variantFormik.values.price}
                    onChange={variantFormik.handleChange}
                    onBlur={variantFormik.handleBlur}
                    error={
                      variantFormik.touched.price &&
                      Boolean(variantFormik.errors.price)
                    }
                    helperText={
                      variantFormik.touched.price && variantFormik.errors.price
                    }
                  />
                </Box>
                <Box width="33%">
                  <StyledTextField
                    fullWidth
                    label="Stock Quantity"
                    name="stock"
                    type="number"
                    value={variantFormik.values.stock}
                    onChange={variantFormik.handleChange}
                    onBlur={variantFormik.handleBlur}
                    error={
                      variantFormik.touched.stock &&
                      Boolean(variantFormik.errors.stock)
                    }
                    helperText={
                      variantFormik.touched.stock && variantFormik.errors.stock
                    }
                  />
                </Box>
                <Box width="33%">
                  <StyledTextField
                    fullWidth
                    label="Discount (%)"
                    name="discount"
                    type="number"
                    value={variantFormik.values.discount}
                    onChange={variantFormik.handleChange}
                    onBlur={variantFormik.handleBlur}
                    error={
                      variantFormik.touched.discount &&
                      Boolean(variantFormik.errors.discount)
                    }
                    helperText={
                      variantFormik.touched.discount &&
                      variantFormik.errors.discount
                    }
                  />
                </Box>
              </Box>

              {/* Image Upload Section */}
              <Box>
                <StyledTypography variant="subtitle1" gutterBottom>
                  Variant Images
                </StyledTypography>

                {variantFormik.values.images.length > 0 && (
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {variantFormik.values.images.map((image, index) => (
                      <Grid item xs={3} key={index}>
                        <Box sx={{ position: "relative" }}>
                          <img
                            src={image}
                            alt={`Variant ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              bgcolor: "white",
                              boxShadow: 1,
                              "&:hover": { bgcolor: "grey.100" },
                            }}
                            onClick={() => removeVariantImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}

                <StyledButton
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Images
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleVariantImageUpload}
                  />
                </StyledButton>
                <StyledTypography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Accepted formats: JPG, JPEG, PNG, WEBP • Multiple images
                  allowed • Show all angles for better conversions
                </StyledTypography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <StyledButton
              onClick={closeVariantDialog}
              type="button"
              variant="outlined"
            >
              Cancel
            </StyledButton>
            <BlackStyledButton type="submit" variant="contained">
              {editingVariantIndex !== null ? "Update" : "Add"} Variant
            </BlackStyledButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductForm;