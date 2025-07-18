import { styled } from "@mui/material";
import { StyledButton } from "./StyledButton"
import { StyledTypography } from "./StyledTypography"
import CloudUploadIcon from "@mui/icons-material/CloudUpload";


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

export const UploadImage = ({handleUpload, msg = ""})=> {
    return (
      <>
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
            onChange={handleUpload}
          />
        </StyledButton>
        <StyledTypography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Accepted formats: JPG, JPEG, PNG, WEBP • Maximum 5MB per image {msg}
        </StyledTypography>
      </>
    );
}