import { styled, TextField } from "@mui/material";

const AuthTextInput = styled(TextField)(() => ({
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  borderRadius: 8,
  "& .MuiInputBase-root": {
    borderRadius: 8,
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#A51930",
    opacity: 1,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "& .MuiOutlinedInput-root:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "transparent",
    },
  "& .MuiFormHelperText-root": {
    backgroundColor: "transparent",
    margin: 0,
    padding: "3px 14px 0",
  },
}));

export default AuthTextInput;
