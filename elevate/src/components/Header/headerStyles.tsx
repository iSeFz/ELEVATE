import { Box, styled } from "@mui/material";

export const StyledHeaderBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "32px",
  marginTop: "16px",
  position: "relative",
});

export const StyledTitleBox = styled(Box)({
  flex: 5,
  textAlign: "center",
});

export const StyledProfileBox = styled(Box)({
  display: "flex",
  gap: "16px",
  flex: 1,
});
