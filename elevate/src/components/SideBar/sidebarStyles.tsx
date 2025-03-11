import {
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  Typography,
} from "@mui/material";
import React from "react";

const CustomBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  // width: 313,
}));

const TitleText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(3),
  color: theme.palette.secondary.main,
  fontWeight: 600,
}));

const StyledListItemText = styled(ListItemText)({
  "& .MuiListItemText-primary": {
    fontWeight: "bold",
  },
  color: "#737791",
});

const StyledListItemStyle = styled(ListItem)({
  borderRadius: "12px",
  margin: "16px",
  width: 250,
});

interface SidebarItemProps {
  handleItemClick: (path: string, itemKey: string) => void;
  getListItemStyles: (itemKey: string) => object;
  getIconColor: (itemKey: string) => string;
  selectedItem: string;
  path: string;
  icon: React.ReactElement;
  name: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  handleItemClick,
  getListItemStyles,
  getIconColor,
  selectedItem,
  path,
  icon,
  name,
}) => {
  return (
    <StyledListItemStyle
      button
      onClick={() => handleItemClick(path, path)}
      sx={getListItemStyles(path)}
    >
      <ListItemIcon>
        {React.cloneElement(icon, {
          htmlColor: getIconColor(path),
        })}
      </ListItemIcon>
      <StyledListItemText
        primary={name}
        slotProps={{
          primary: {
            color: selectedItem === path ? "white" : "inherit",
          },
        }}
      />
    </StyledListItemStyle>
  );
};

export { CustomBox, TitleText, SidebarItem };
