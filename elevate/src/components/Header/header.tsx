import { FC } from "react";
import { useLocation } from "react-router";
import { Avatar, Box, Typography } from "@mui/material";

import {
  StyledHeaderBox,
  StyledProfileBox,
  StyledTitleBox,
} from "./headerStyles";
import { useUser } from "../../context/userContext";

interface PageTitles {
  [key: string]: string;
}

function formatRole(str: string) {
  if (str === "brandOwner") return "Brand Owner";
  if (str === "brandManager") return "Brand Manager";
  return str;
}

export const Header: FC = () => {
  const { userData } = useUser();
  const location = useLocation();

  const pageTitles: PageTitles = {
    "": "Dashboard",
    "profile": "Brand Profile",
    "products": "Manage Products",
    "settings": "Settings",
    "logout": "Sign Out",
  };

  const pageTitle = pageTitles[location.pathname.split("/")[1]] || "Page";

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
            {userData?.firstName || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatRole(userData?.role) || "User"}
          </Typography>
        </Box>
      </StyledProfileBox>
    </StyledHeaderBox>
  );
};
