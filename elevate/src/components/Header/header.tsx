import { FC } from "react";
import { useLocation } from "react-router";
import { Avatar, Box, Typography } from "@mui/material";

import {
  StyledHeaderBox,
  StyledProfileBox,
  StyledTitleBox,
} from "./headerStyles";

interface PageTitles {
  [key: string]: string;
}

export const Header: FC = () => {
  const location = useLocation();

  const pageTitles: PageTitles = {
    "/": "Dashboard",
    "/profile": "Brand Profile",
    "/products": "Manage Products",
    "/settings": "Settings",
    "/logout": "Sign Out",
  };

  const pageTitle = pageTitles[location.pathname] || "Page";

  return (
    <StyledHeaderBox>
      <StyledTitleBox>
        <Typography variant="h4" fontWeight="600">
          {pageTitle}
        </Typography>
      </StyledTitleBox>
      <StyledProfileBox>
        <Avatar src="/icons/User.svg" />
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Shawky
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Brand Owner
          </Typography>
        </Box>
      </StyledProfileBox>
    </StyledHeaderBox>
  );
};
