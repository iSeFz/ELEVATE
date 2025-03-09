import { Box, styled, Typography } from "@mui/material";

export const CustomBox = styled(Box)(({ theme }) => ({
    background: theme.palette.primary.main,
    width: 313, 
    height: '100vh'
}));

export const TitleText = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(3),
    color: theme.palette.secondary.main,
    fontWeight: 600,
}));
