import {
  Box,
  Typography,
  Card,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  BlackStyledButton,
  StyledButton,
} from "../../../../../components/StyledButton";
import { StyledTypography } from "../../../../../components/StyledTypography";
import { StyledTextField } from "../../../../../components/StyledTextField";
import { useUser } from "../../../../../hooks/userHook";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBrandOwnerData } from "../../../../../api/endpoints";
import * as yup from "yup";
import { useFormik } from "formik"; // Adjust this path
import { uploadImageAndGetURL } from "../../../../../services/imageUpload";

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "First name must contain only letters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "Last name must contain only letters"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  imageURL: yup.string(),
});

export const EditAccount = () => {
  const { userData } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (values: {
      firstName: string;
      lastName: string;
      username: string;
      imageURL: string;
      file?: File | null;
    }) => {
      let finalImageURL = values.imageURL;

      // If there's a new file to upload, upload it first
      if (values.file) {
        try {
          const timestamp = Date.now();
          const fileName = `profile-images/${userData?.id || "user"}-${timestamp}-${values.file.name}`;
          finalImageURL = await uploadImageAndGetURL(values.file, fileName);
        } catch (error) {
          console.error("Error uploading image:", error);
          throw new Error("Failed to upload image");
        }
      }

      // Now update the user data with the final image URL
      return updateBrandOwnerData({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        imageURL: finalImageURL,
      });
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Account updated successfully!",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/settings/account");
      }, 1500);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message:
          error?.message || "Failed to update account. Please try again.",
        severity: "error",
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      imageURL: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        imageURL: values.imageURL,
        file: selectedFile,
      });
    },
  });

  useEffect(() => {
    if (userData) {
      formik.setValues({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
        email: userData.email || "",
        imageURL: userData.imageURL || "",
      });
      setImagePreview(userData.imageURL || "");
    }
  }, [userData]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validation checks
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "File size must be less than 5MB",
          severity: "error",
        });
        return;
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: "Please upload only JPG, JPEG, or PNG files",
          severity: "error",
        });
        return;
      }

      // Store the file for later upload
      setSelectedFile(file);

      // Show preview using FileReader (local preview)
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // Don't set imageURL yet - will be set after upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    formik.setFieldValue("imageURL", "");
    setSnackbar({
      open: true,
      message: "Profile picture removed",
      severity: "info",
    });
  };

  const handleCancel = () => {
    formik.resetForm();
    setSelectedFile(null);
    if (userData) {
      formik.setValues({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
        email: userData.email || "",
        imageURL: userData.imageURL || "",
      });
      setImagePreview(userData.imageURL || "");
    }
    navigate("/settings/account");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" marginBottom={4}>
        <Typography fontWeight="bold" variant="h5">
          Account Info
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" gap={8} marginTop={3} width="100%">
          <Box display="flex" flexDirection="column" gap={3} width="60%">
            <Box display="flex" justifyContent="space-between">
              <Box width={"47%"}>
                <StyledTypography>First Name</StyledTypography>
                <StyledTextField
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.firstName && Boolean(formik.errors.firstName)
                  }
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
                  fullWidth
                />
              </Box>

              <Box width={"47%"}>
                <StyledTypography>Last Name</StyledTypography>
                <StyledTextField
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.lastName && Boolean(formik.errors.lastName)
                  }
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  fullWidth
                />
              </Box>
            </Box>

            <Box>
              <StyledTypography>Username</StyledTypography>
              <StyledTextField
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.username && Boolean(formik.errors.username)
                }
                helperText={formik.touched.username && formik.errors.username}
                fullWidth
              />
            </Box>

            <Box>
              <StyledTypography>Email</StyledTypography>
              <StyledTextField
                name="email"
                disabled
                value={formik.values.email}
                fullWidth
              />
            </Box>
          </Box>

          <Box width="40%">
            <Typography variant="subtitle1" marginBottom={2} fontWeight="bold">
              Profile Picture
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              {/* Image preview area */}
              {imagePreview && (
                <Box position="relative" display="inline-block">
                  <Card
                    sx={{
                      padding: 1,
                      backgroundColor: "#f5f5f5",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={imagePreview || "/images/userImage.jpg"}
                      alt="Profile Picture"
                      style={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/userImage.jpg";
                      }}
                    />
                  </Card>
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    disabled={mutation.isPending}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: "background.paper",
                      boxShadow: 2,
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "white",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Upload button */}
              <Box
                onClick={mutation.isPending ? undefined : handleUploadClick}
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  padding: 3,
                  textAlign: "center",
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  backgroundColor: "#fafafa",
                  transition: "all 0.3s",
                  opacity: mutation.isPending ? 0.6 : 1,
                  "&:hover": {
                    borderColor: mutation.isPending ? "#ccc" : "#1976d2",
                    backgroundColor: mutation.isPending ? "#fafafa" : "#f5f5f5",
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: "#666", mb: 1 }} />
                <Typography variant="body1" fontWeight="500">
                  {selectedFile ? "Change Image" : "Upload Image"}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Accepted formats: JPG, JPEG, PNG • Maximum file size: 5MB
                {selectedFile && (
                  <Typography variant="caption" color="primary" display="block">
                    New image selected: {selectedFile.name}
                  </Typography>
                )}
              </Typography>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              style={{ display: "none" }}
              onChange={handleImageChange}
              disabled={mutation.isPending}
            />
          </Box>
        </Box>

        <Box justifyContent="right" display="flex" gap={2} marginTop={4}>
          <StyledButton
            size="large"
            onClick={handleCancel}
            type="button"
            variant="outlined"
            disabled={mutation.isPending}
          >
            Cancel
          </StyledButton>
          <BlackStyledButton
            type="submit"
            variant="contained"
            size="large"
            disabled={mutation.isPending || !formik.isValid}
          >
            {mutation.isPending ? "Updating..." : "Update"}
          </BlackStyledButton>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
