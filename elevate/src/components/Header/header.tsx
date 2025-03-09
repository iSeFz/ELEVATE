import { FC } from "react";
import { StyledHeaderBox, StyledProfileBox, StyledTitleBox } from "./headerStyles";
import { Avatar, Box, Typography } from "@mui/material";

export const Header: FC = () => (
  <StyledHeaderBox>
    <StyledTitleBox>
      <Typography variant="h4" fontWeight="600">
        Dashboard
      </Typography>
    </StyledTitleBox>
    <StyledProfileBox>
      <Avatar src="User.svg" />
      <Box>
        <Typography variant="subtitle2" fontWeight="bold">Shawky</Typography>
        <Typography variant="body2" color="text.secondary">
          Brand Owner
        </Typography>
      </Box>
    </StyledProfileBox>
  </StyledHeaderBox>
);