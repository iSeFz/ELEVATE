import { styled, TextField } from "@mui/material";

export const StyledTextField = styled(TextField)({
  backgroundColor: "#ffffff",
  borderRadius: 12,
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "#ffffff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#afafaf",
      borderWidth: 1,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
      borderWidth: 2,
    },
  },
  "& label.Mui-focused": {
    color: "#000",
  },
  "& .MuiOutlinedInput-root.Mui-disabled": {
    backgroundColor: "#eeeeee",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#eeeeee",
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    borderRadius: 10,
    backgroundColor: "#eeeeee",
  },
});
