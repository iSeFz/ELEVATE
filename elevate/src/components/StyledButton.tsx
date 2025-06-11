import { styled, Button } from "@mui/material";

export const StyledButton = styled(Button)({
  borderColor: "#C3D3E2",
  color: "black",
  borderWidth: 2,
  borderRadius: 8,
  height: 40,
  textTransform: "none",
  fontWeight: "bold",
  fontSize: 13,
  "&:hover": {
    backgroundColor: "#f5f5f5",
    borderColor: "#000000",
  },
});

export const BlackStyledButton = styled(Button)({
  backgroundColor: "black",
  color: "white",
  borderWidth: 2,
  borderRadius: 8,
  height: 40,
  textTransform: "none",
  fontWeight: "bold",
  fontSize: 13,
  "&:hover": {
    backgroundColor: "#323232"
  },
});
