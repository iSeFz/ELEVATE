import { Box, ListItemText, styled, Typography } from "@mui/material";

export const CustomBox = styled(Box)(({ theme }) => ({
    background: theme.palette.primary.main,
    // width: 313,
}));

export const TitleText = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(3),
    color: theme.palette.secondary.main,
    fontWeight: 600,
}));

export const StyledListItemText = styled(ListItemText)({
  '& .MuiListItemText-primary': {
    fontWeight:'bold', 
  },
  color:"#737791"
});
