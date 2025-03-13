import { styled, TextField } from "@mui/material";

export const StyledTextField = styled(TextField)({
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
