import { styled, Select, MenuItem, Autocomplete, FormControl } from "@mui/material";

export const StyledSelect = styled(Select)({
  backgroundColor: "#ffffff",
  borderRadius: 12,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#afafaf",
    borderWidth: 1,
    borderRadius: 12,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#afafaf",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
    borderWidth: 2,
  },
  "&.Mui-disabled": {
    backgroundColor: "#eeeeee",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#eeeeee",
    },
  },
  "& .MuiSelect-select": {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    "&.Mui-disabled": {
      backgroundColor: "#eeeeee",
      WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
    },
  },
  "& .MuiSelect-icon": {
    color: "#afafaf",
  },
  "&.Mui-focused .MuiSelect-icon": {
    color: "#000000",
  },
  "&.Mui-disabled .MuiSelect-icon": {
    color: "#afafaf",
  },
});

// If you also want to style the dropdown menu paper
export const StyledMenuItem = styled(MenuItem)({
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
  "&.Mui-selected": {
    backgroundColor: "#e0e0e0",
    "&:hover": {
      backgroundColor: "#d0d0d0",
    },
  },
});

export const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#afafaf",
      borderWidth: 1,
      borderRadius: 12,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#afafaf",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
      borderWidth: 2,
    },
    "&.Mui-disabled": {
      backgroundColor: "#eeeeee",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#eeeeee",
      },
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: "#000000",
    },
  },
  "& .MuiAutocomplete-input": {
    backgroundColor: "transparent",
    "&.Mui-disabled": {
      backgroundColor: "#eeeeee",
      WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
    },
  },
  "& .MuiAutocomplete-endAdornment": {
    "& .MuiButtonBase-root": {
      color: "#afafaf",
    },
  },
  "&.Mui-focused .MuiAutocomplete-endAdornment .MuiButtonBase-root": {
    color: "#000000",
  },
});

// Styled Paper for the dropdown options
export const StyledAutocompleteOption = {
  sx: {
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
    '&[aria-selected="true"]': {
      backgroundColor: "#e0e0e0",
      "&:hover": {
        backgroundColor: "#d0d0d0",
      },
    },
  },
};

export const StyledFormControl = styled(FormControl)({
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: "#000000", // Black when focused
    },
    "&.MuiInputLabel-shrink": {
      color: "#000000", // Black when value is selected (label shrunk)
    },
  },
});