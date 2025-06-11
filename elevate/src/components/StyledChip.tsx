import { styled, Chip } from "@mui/material";

export const StlyedChip = styled(Chip)({
  backgroundColor: "#000000",
  color: "#ffffff",
  "& .MuiChip-deleteIcon": {
    color: "#e2e2e2",
    fontSize: 18,
    "&:hover": {
      color: "#cccccc",
    },
  },
});
