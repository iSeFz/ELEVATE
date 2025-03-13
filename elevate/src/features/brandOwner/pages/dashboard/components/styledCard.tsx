import { styled, Card } from "@mui/material";

export const StyledCard = styled(Card)(({ theme }) => ({
  flex: 1,
  borderRadius: 20,
  boxShadow: "0px 4px 20px rgba(237, 237, 237, 0.5)",
  marginBottom: theme.spacing(3),
}));
