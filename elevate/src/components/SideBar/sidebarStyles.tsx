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
}));

const TitleText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(3),
  color: theme.palette.secondary.main,
  fontWeight: 600,
}));

const StyledListItemText = styled(ListItemText)({
  "& .MuiListItemText-primary": {
    fontWeight: "bold",
    transition: "color 0.2s ease",
  },
  color: "#737791",
});

const StyledListItemStyle = styled(ListItem)({
  borderRadius: "12px",
  margin: "16px",
  width: 250,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#e1e1e1",
  },
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
  const pathStyle = path.split("/")[1];
  const isSelected = selectedItem === pathStyle;

  return (
    <StyledListItemStyle
      button
      onClick={() => handleItemClick(path, pathStyle)} // Fixed: using pathStyle as second parameter
      sx={{
        ...getListItemStyles(pathStyle),
        "&:hover .MuiListItemText-primary": {
          color: isSelected ? "black" : "inherit",
        },
        "&:hover .MuiListItemIcon-root": {
          color: isSelected ? "black" : "inherit",
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: getIconColor(pathStyle),
          transition: "color 0.2s ease",
        }}
      >
        {icon}
      </ListItemIcon>
      <StyledListItemText
        primary={name}
        primaryTypographyProps={{
          sx: {
            color: isSelected ? "white" : "inherit",
          },
        }}
      />
    </StyledListItemStyle>
  );
};

export { CustomBox, TitleText, SidebarItem };
