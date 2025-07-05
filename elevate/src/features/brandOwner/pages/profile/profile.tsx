import { use, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";

import { StyledSvgIcon } from "./StyledSvgIcon";
import {
  BlackStyledButton,
  StyledButton,
} from "../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../components/StyledSmallSvgIcon";
import { StyledTextField } from "../../../../components/StyledTextField";
import { StyledTypography } from "../../../../components/StyledTypography";
import { StlyedChip } from "../../../../components/StyledChip";
import { useBrand } from "../../../../hooks/brandHook";
import { useUser } from "../../../../hooks/userHook";
import { UploadImage } from "../../../../components/UploadImage";
import ImageDelete from "../../../../components/ImageDelete";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateBrandData } from "../../../../api/endpoints";
import { useSnackbar } from "notistack";

interface Address {
  building: number;
  city: string;
  postalCode: number;
  street: string;
}

interface Website {
  type: string;
  url: string;
}

interface EditProfileData {
  brandName: string;
  email: string;
  industry: string;
  addresses: Address[];
  websites: Website[];
  phoneNumbers: string[];
  imageURL: string;
  storyDescription: string;
}

const formatAddress = (address: Address): string => {
  return `${address.building} ${address.street}, ${address.city} ${address.postalCode}`;
};

// Validation Schema
const validationSchema = Yup.object({
  brandName: Yup.string()
    .trim()
    .required("Brand name is required")
    .min(1, "Brand name must be at least 1 characters")
    .max(30, "Brand name must be at most 30 characters"),
  email: Yup.string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  industry: Yup.string()
    .trim()
    .required("Industry is required")
    .min(1, "Industry must be at least 1 characters")
    .max(30, "Industry must be at most 30 characters"),
  addresses: Yup.array()
    .of(
      Yup.object({
        building: Yup.number()
          .required("Building number is required")
          .positive("Building number must be positive")
          .integer("Building number must be an integer"),
        city: Yup.string()
          .trim()
          .required("City is required")
          .min(1, "City name must be at least 1 characters")
          .max(20, "City name must be at most 20 characters"),
        postalCode: Yup.number()
          .required("Postal code is required")
          .positive("Postal code must be positive")
          .integer("Postal code must be an integer"),
        street: Yup.string()
          .trim()
          .required("Street is required")
          .min(1, "Street name must be at least 1 characters")
          .max(100, "Street name must be at most 100 characters"),
      })
    )
    .max(6, "Maximum 6 addresses allowed"),
  websites: Yup.array()
    .of(
      Yup.object({
        type: Yup.string().required("Website type is required"),
        url: Yup.string()
          .trim()
          .required("URL is required")
          .url("Must be a valid URL (e.g., https://example.com)"),
      })
    )
    .max(8, "Maximum 8 addresses allowed"),
  phoneNumbers: Yup.array().of(
    Yup.string()
      .required("Phone number is required")
      .matches(
        /^(010|011|012|015)[0-9]{8}$/,
        "Phone number must be 11 digits starting with 010, 011, 012, or 015"
      )
  ).max(5, "Maximum 5 phone numbers allowed"),
  storyDescription: Yup.string()
    .trim()
    .nullable()
    .max(500, "Story must be at most 500 characters"),
});

const Profile = ({ isEditMode }: { isEditMode: boolean }) => {
  const navigate = useNavigate();

  const { brandData, updateBrandData } = useBrand();
  const { userData } = useUser();

  const { enqueueSnackbar } = useSnackbar();

  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showWebsiteDialog, setShowWebsiteDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showSocialDialog, setShowSocialDialog] = useState(false);

  const mutation = useMutation({
    mutationFn: UpdateBrandData,
    onSuccess: () => {
      enqueueSnackbar("Profile updated successfully!", {variant: "success"});
      queryClient.invalidateQueries({ queryKey: ["brand"] });
      navigate("/profile");
    },
    onError: (error: any) => {
      console.error("Error updating profile:", error);
      enqueueSnackbar("Failed to update profile. Please try again.", {variant: "error"});
    },
  });

  const [newAddress, setNewAddress] = useState<Address>({
    building: 0,
    city: "",
    postalCode: 0,
    street: "",
  });

  const [newWebsite, setNewWebsite] = useState<Website>({
    type: "web",
    url: "",
  });

  const [newPhone, setNewPhone] = useState("");

  const [newSocial, setNewSocial] = useState<Website>({
    type: "instagram",
    url: "",
  });

  // Validation states for dialogs
  const [addressErrors, setAddressErrors] = useState<Partial<Address>>({});
  const [websiteError, setWebsiteError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [socialError, setSocialError] = useState("");
  const queryClient = useQueryClient();

  // Initial values
  const initialValues: EditProfileData = {
    brandName: brandData?.brandName || "",
    email: userData?.email || "",
    industry: brandData?.industry || "",
    addresses: brandData?.addresses || [],
    websites: brandData?.websites || [],
    phoneNumbers: brandData?.phoneNumbers || [],
    imageURL: brandData?.imageURL || "",
    storyDescription: brandData?.storyDescription || "",
  };

  const handleSubmit = async (values: EditProfileData) => {
    try {
      mutation.mutate({
        brandName: values.brandName,
        email: values.email,
        industry: values.industry,
        addresses: values.addresses,
        websites: values.websites,
        phoneNumbers: values.phoneNumbers,
        imageURL: values.imageURL,
        storyDescription: values.storyDescription,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("File size must be less than 5MB", {variant: "error"});
        return;
      }

      // Validate file type
      const acceptedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!acceptedTypes.includes(file.type)) {
        enqueueSnackbar("Only JPG, JPEG, and PNG files are accepted", {variant: "error"});
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue("imageURL", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate address before adding
  const validateAddress = (address: Address): boolean => {
    const errors: Partial<Address> = {};

    if (!address.building || address.building <= 0) {
      errors.building = 1; // Using number as error flag
    }
    if (!address.street || address.street.trim().length < 2) {
      errors.street = "Street is required and must be at least 2 characters";
    }
    if (!address.city || address.city.trim().length < 2) {
      errors.city = "City is required and must be at least 2 characters";
    }
    if (!address.postalCode || address.postalCode <= 0) {
      errors.postalCode = 1;
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate website before adding
  const validateWebsite = (url: string): boolean => {
    if (!url) {
      setWebsiteError("URL is required");
      return false;
    }

    try {
      new URL(url);
      setWebsiteError("");
      return true;
    } catch {
      setWebsiteError("Must be a valid URL (e.g., https://example.com)");
      return false;
    }
  };

  // Validate phone before adding
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError(
        "Phone number must be 11 digits starting with 010, 011, 012, or 015"
      );
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Image Upload Component
  const ImageUploadSection = ({ formik }: { formik: any }) => {
    const currentImageURL = isEditMode
      ? formik.values.imageURL
      : brandData?.imageURL;

    return (
      <Box>
        <StyledTypography>Brand Logo</StyledTypography>

        <Box sx={{ maxWidth: 400 }}>
          <Box sx={{ position: "relative", mb: 2 }}>
            <Box
              sx={{
                width: 280,
                height: 280,
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "#f0f0f0",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={currentImageURL || "/images/userImage.jpg"}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.src = "/images/userImage.jpg";
                }}
              />
            </Box>

            {isEditMode && currentImageURL && (
              <ImageDelete
                onClick={() => formik.setFieldValue("imageURL", "")}
                pending={formik.isSubmitting}
              />
            )}
          </Box>

          {isEditMode && (
            <UploadImage
              handleUpload={(e) => handleImageUpload(e, formik.setFieldValue)}
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnBlur={true}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formik) => (
        <Form>
          <Box padding={2} marginLeft={2}>
            {/* Header Actions */}
            <Box display="flex" justifyContent="right" marginRight={8} gap={2}>
              {!isEditMode ? (
                <StyledButton
                  variant="outlined"
                  onClick={() => navigate("/profile/edit")}
                >
                  <StyledSmallSvgIcon>
                    <image href="/icons/Edit.svg" width="100%" height="100%" />
                  </StyledSmallSvgIcon>
                  &nbsp; Edit
                </StyledButton>
              ) : (
                <>
                  <StyledButton
                    variant="outlined"
                    onClick={() => {
                      formik.resetForm();
                      navigate("/profile");
                    }}
                  >
                    Cancel
                  </StyledButton>
                  <BlackStyledButton
                    variant="contained"
                    type="submit"
                    disabled={formik.isSubmitting || !formik.isValid}
                  >
                    {formik.isSubmitting ? "Saving..." : <>Save</>}
                  </BlackStyledButton>
                </>
              )}
            </Box>

            {/* Main Content */}
            <Box display="flex" gap={8}>
              {/* Left Column */}
              <Box display="flex" flexDirection="column" gap={3} width={500}>
                {/* Brand Name */}
                <Box>
                  <StyledTypography>Brand Name</StyledTypography>
                  <StyledTextField
                    name="brandName"
                    value={
                      isEditMode
                        ? formik.values.brandName
                        : brandData?.brandName
                    }
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      isEditMode &&
                      formik.touched.brandName &&
                      Boolean(formik.errors.brandName)
                    }
                    helperText={
                      isEditMode &&
                      formik.touched.brandName &&
                      typeof formik.errors.brandName === "string"
                        ? formik.errors.brandName
                        : ""
                    }
                    fullWidth
                    disabled={!isEditMode}
                  />
                </Box>

                {/* Brand Email */}
                <Box>
                  <StyledTypography>Brand Email</StyledTypography>
                  <StyledTextField
                    name="email"
                    value={userData?.email}
                    fullWidth
                    disabled
                  />
                </Box>

                {/* Industry */}
                <Box>
                  <StyledTypography>Industry</StyledTypography>
                  {isEditMode ? (
                    <StyledTextField
                      name="industry"
                      value={formik.values.industry}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.industry &&
                        Boolean(formik.errors.industry)
                      }
                      helperText={
                        formik.touched.industry &&
                        typeof formik.errors.industry === "string"
                          ? formik.errors.industry
                          : ""
                      }
                      fullWidth
                      placeholder="Enter industry"
                    />
                  ) : (
                    <Box
                      padding={2}
                      border="1px solid #000000"
                      borderRadius={2}
                      height={110}
                    >
                      <StlyedChip label={brandData?.industry} />
                    </Box>
                  )}
                </Box>

                {/* Addresses */}
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <StyledTypography>Addresses</StyledTypography>
                    {isEditMode && (
                      <IconButton
                        onClick={() => setShowAddressDialog(true)}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>
                  <FieldArray name="addresses">
                    {({ remove, push }) => (
                      <Box display="flex" flexDirection="column" gap={2}>
                        {(isEditMode
                          ? formik.values.addresses
                          : brandData?.addresses || []
                        ).map((address: Address, index: number) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <StyledSvgIcon>
                              <image
                                href="/icons/Location.svg"
                                width="100%"
                                height="100%"
                              />
                            </StyledSvgIcon>
                            <Typography flex={1}>
                              {formatAddress(address)}
                            </Typography>
                            {isEditMode && (
                              <IconButton
                                onClick={() => remove(index)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FieldArray>
                </Box>

                {/* Websites */}
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <StyledTypography>Websites</StyledTypography>
                    {isEditMode && (
                      <IconButton
                        onClick={() => setShowWebsiteDialog(true)}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>
                  <FieldArray name="websites">
                    {({ remove }) => (
                      <Box display="flex" flexDirection="column" gap={1}>
                        {(isEditMode
                          ? formik.values.websites
                          : brandData?.websites || []
                        )
                          .filter((website: Website) => website.type === "web")
                          .map((website: Website, index: number) => {
                            const originalIndex = (
                              isEditMode
                                ? formik.values.websites
                                : brandData?.websites || []
                            ).findIndex((w) => w === website);
                            return (
                              <Box
                                key={index}
                                display="flex"
                                alignItems="center"
                                gap={1}
                              >
                                <StyledSvgIcon>
                                  <image
                                    href="/icons/Website.svg"
                                    width="100%"
                                    height="100%"
                                  />
                                </StyledSvgIcon>
                                <Typography flex={1}>{website.url}</Typography>
                                {isEditMode && (
                                  <IconButton
                                    onClick={() => remove(originalIndex)}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </Box>
                            );
                          })}
                      </Box>
                    )}
                  </FieldArray>
                </Box>
              </Box>

              {/* Right Column */}
              <Box>
                {/* Brand Logo / Profile Picture */}
                <ImageUploadSection formik={formik} />

                {/* Contacts */}
                <Box sx={{ mt: 4 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="subtitle1"
                      marginBottom={1}
                      fontWeight="bold"
                    >
                      Contacts
                    </Typography>
                    {isEditMode && (
                      <IconButton
                        onClick={() => setShowPhoneDialog(true)}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>
                  <FieldArray name="phoneNumbers">
                    {({ remove }) => (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {(isEditMode
                          ? formik.values.phoneNumbers
                          : brandData?.phoneNumbers || []
                        ).map((contact: string, index: number) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <StyledSvgIcon>
                              <image
                                href="/icons/Contact.svg"
                                width="100%"
                                height="100%"
                              />
                            </StyledSvgIcon>
                            <Typography flex={1}>{contact}</Typography>
                            {isEditMode && (
                              <IconButton
                                onClick={() => remove(index)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FieldArray>
                </Box>

                {/* Socials */}
                <Box sx={{ mt: 4 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="subtitle1"
                      marginBottom={1}
                      fontWeight="bold"
                    >
                      Socials
                    </Typography>
                    {isEditMode && (
                      <IconButton
                        onClick={() => setShowSocialDialog(true)}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>
                  <FieldArray name="websites">
                    {({ remove }) => (
                      <Box display="flex" flexDirection="column" gap={1}>
                        {(isEditMode
                          ? formik.values.websites
                          : brandData?.websites || []
                        )
                          .filter((website: Website) => website.type !== "web")
                          .map((website: Website, index: number) => {
                            const originalIndex = (
                              isEditMode
                                ? formik.values.websites
                                : brandData?.websites || []
                            ).findIndex((w) => w === website);
                            return (
                              <Box
                                key={index}
                                display="flex"
                                alignItems="center"
                                gap={1}
                              >
                                <StyledSvgIcon>
                                  {website.type === "instagram" && (
                                    <image
                                      href="/icons/Instagram.svg"
                                      width="100%"
                                      height="100%"
                                    />
                                  )}
                                  {website.type === "x" && (
                                    <image
                                      href="/icons/x.svg"
                                      width="100%"
                                      height="100%"
                                    />
                                  )}
                                  {website.type === "facebook" && (
                                    <image
                                      href="/icons/Facebook.svg"
                                      width="100%"
                                      height="100%"
                                    />
                                  )}
                                </StyledSvgIcon>
                                <Typography flex={1}>{website.url}</Typography>
                                {isEditMode && (
                                  <IconButton
                                    onClick={() => remove(originalIndex)}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </Box>
                            );
                          })}
                      </Box>
                    )}
                  </FieldArray>
                </Box>
              </Box>
            </Box>

            {/* Brand Story */}
            <Box width="95%" marginTop={2}>
              <StyledTypography
                variant="subtitle1"
                marginBottom={1}
                fontWeight="bold"
              >
                Brand Story
              </StyledTypography>
              <StyledTextField
                name="storyDescription"
                fullWidth
                multiline
                rows={4}
                disabled={!isEditMode}
                value={
                  isEditMode
                    ? formik.values.storyDescription
                    : brandData?.storyDescription || "No story provided."
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={
                  isEditMode ? "Tell your brand story..." : undefined
                }
              />
            </Box>

            {/* Dialogs */}
            {/* Address Dialog */}
            <Dialog
              open={showAddressDialog}
              onClose={() => {
                setShowAddressDialog(false);
                setAddressErrors({});
                setNewAddress({
                  building: 0,
                  city: "",
                  postalCode: 0,
                  street: "",
                });
              }}
            >
              <DialogTitle>Add New Address</DialogTitle>
              <DialogContent>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                  sx={{ pt: 2, minWidth: 400 }}
                >
                  <StyledTextField
                    label="Building Number"
                    type="number"
                    value={newAddress.building || ""}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        building: parseInt(e.target.value) || 0,
                      })
                    }
                    error={!!addressErrors.building}
                    helperText={
                      addressErrors.building
                        ? "Building number is required"
                        : ""
                    }
                    fullWidth
                  />
                  <StyledTextField
                    label="Street"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    error={!!addressErrors.street}
                    helperText={addressErrors.street || ""}
                    fullWidth
                  />
                  <StyledTextField
                    label="City"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    error={!!addressErrors.city}
                    helperText={addressErrors.city || ""}
                    fullWidth
                  />
                  <StyledTextField
                    label="Postal Code"
                    type="number"
                    value={newAddress.postalCode || ""}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        postalCode: parseInt(e.target.value) || 0,
                      })
                    }
                    error={!!addressErrors.postalCode}
                    helperText={
                      addressErrors.postalCode ? "Postal code is required" : ""
                    }
                    fullWidth
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <StyledButton
                  onClick={() => {
                    setShowAddressDialog(false);
                    setAddressErrors({});
                    setNewAddress({
                      building: 0,
                      city: "",
                      postalCode: 0,
                      street: "",
                    });
                  }}
                >
                  Cancel
                </StyledButton>
                <StyledButton
                  onClick={() => {
                    if (validateAddress(newAddress)) {
                      const addresses = [
                        ...formik.values.addresses,
                        newAddress,
                      ];
                      formik.setFieldValue("addresses", addresses);
                      setNewAddress({
                        building: 0,
                        city: "",
                        postalCode: 0,
                        street: "",
                      });
                      setAddressErrors({});
                      setShowAddressDialog(false);
                    }
                  }}
                  variant="contained"
                >
                  Add
                </StyledButton>
              </DialogActions>
            </Dialog>

            {/* Website Dialog */}
            <Dialog
              open={showWebsiteDialog}
              onClose={() => {
                setShowWebsiteDialog(false);
                setWebsiteError("");
                setNewWebsite({ type: "web", url: "" });
              }}
            >
              <DialogTitle>Add New Website</DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2, minWidth: 400 }}>
                  <StyledTextField
                    label="Website URL"
                    value={newWebsite.url}
                    onChange={(e) => {
                      setNewWebsite({ ...newWebsite, url: e.target.value });
                      setWebsiteError("");
                    }}
                    error={!!websiteError}
                    helperText={websiteError}
                    fullWidth
                    placeholder="https://example.com"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <StyledButton
                  onClick={() => {
                    setShowWebsiteDialog(false);
                    setWebsiteError("");
                    setNewWebsite({ type: "web", url: "" });
                  }}
                >
                  Cancel
                </StyledButton>
                <StyledButton
                  onClick={() => {
                    if (validateWebsite(newWebsite.url)) {
                      const websites = [...formik.values.websites, newWebsite];
                      formik.setFieldValue("websites", websites);
                      setNewWebsite({ type: "web", url: "" });
                      setWebsiteError("");
                      setShowWebsiteDialog(false);
                    }
                  }}
                  variant="contained"
                >
                  Add
                </StyledButton>
              </DialogActions>
            </Dialog>

            {/* Phone Dialog */}
            <Dialog
              open={showPhoneDialog}
              onClose={() => {
                setShowPhoneDialog(false);
                setPhoneError("");
                setNewPhone("");
              }}
            >
              <DialogTitle>Add New Phone Number</DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2, minWidth: 400 }}>
                  <StyledTextField
                    label="Phone Number"
                    value={newPhone}
                    onChange={(e) => {
                      setNewPhone(e.target.value);
                      setPhoneError("");
                    }}
                    error={!!phoneError}
                    helperText={phoneError}
                    fullWidth
                    placeholder="01234567890"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <StyledButton
                  onClick={() => {
                    setShowPhoneDialog(false);
                    setPhoneError("");
                    setNewPhone("");
                  }}
                >
                  Cancel
                </StyledButton>
                <StyledButton
                  onClick={() => {
                    if (validatePhone(newPhone)) {
                      const phoneNumbers = [
                        ...formik.values.phoneNumbers,
                        newPhone,
                      ];
                      formik.setFieldValue("phoneNumbers", phoneNumbers);
                      setNewPhone("");
                      setPhoneError("");
                      setShowPhoneDialog(false);
                    }
                  }}
                  variant="contained"
                >
                  Add
                </StyledButton>
              </DialogActions>
            </Dialog>

            {/* Social Dialog */}
            <Dialog
              open={showSocialDialog}
              onClose={() => {
                setShowSocialDialog(false);
                setSocialError("");
                setNewSocial({ type: "instagram", url: "" });
              }}
            >
              <DialogTitle>Add New Social Media</DialogTitle>
              <DialogContent>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                  sx={{ pt: 2, minWidth: 400 }}
                >
                  <StyledTextField
                    select
                    label="Platform"
                    value={newSocial.type}
                    onChange={(e) =>
                      setNewSocial({ ...newSocial, type: e.target.value })
                    }
                    fullWidth
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="x">X (Twitter)</option>
                    <option value="facebook">Facebook</option>
                  </StyledTextField>
                  <StyledTextField
                    label="Profile URL"
                    value={newSocial.url}
                    onChange={(e) => {
                      setNewSocial({ ...newSocial, url: e.target.value });
                      setSocialError("");
                    }}
                    error={!!socialError}
                    helperText={socialError}
                    fullWidth
                    placeholder="https://instagram.com/yourbrand"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <StyledButton
                  onClick={() => {
                    setShowSocialDialog(false);
                    setSocialError("");
                    setNewSocial({ type: "instagram", url: "" });
                  }}
                >
                  Cancel
                </StyledButton>
                <StyledButton
                  onClick={() => {
                    if (validateWebsite(newSocial.url)) {
                      const websites = [...formik.values.websites, newSocial];
                      formik.setFieldValue("websites", websites);
                      setNewSocial({ type: "instagram", url: "" });
                      setSocialError("");
                      setShowSocialDialog(false);
                    } else {
                      setSocialError("Must be a valid URL");
                    }
                  }}
                  variant="contained"
                >
                  Add
                </StyledButton>
              </DialogActions>
            </Dialog>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default Profile;
