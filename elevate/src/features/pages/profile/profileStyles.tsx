import { Chip, styled, SvgIcon, TextField, Typography } from "@mui/material";

export const StyledTextField = styled(TextField)({
  width: "100%",
  backgroundColor: "#eeeeee",
  borderRadius: 10,
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#eeeeee",
      borderWidth: 2,
    },
  },
  "& .MuiOutlinedInput-root.Mui-disabled": {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#eeeeee",
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    borderRadius: 10,
    backgroundColor: "#eeeeee",
  },
});

export const StyledTypography = styled(Typography)({
  variant: "subtitle1",
  marginBottom: "8px",
  fontWeight: "bold",
});

export const StlyedChip = styled(Chip)({
  backgroundColor: "#000000",
  color: "#ffffff",
  size: "small",
});

export const StyledSvgIcon = styled(SvgIcon)({
  fontSize: 34,
});
