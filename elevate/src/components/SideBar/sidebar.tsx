import { FC, useState, useEffect } from "react";
import { List } from "@mui/material";
import {
  Logout,
  PieChartOutline,
  PersonOutline,
  ShoppingBagOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";

import { CustomBox, TitleText, SidebarItem } from "./sidebarStyles";

//might need some clean up also do a hover effect
const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState("");

  useEffect(() => {
    setSelectedItem(location.pathname.split("/")[1] || "");
  }, [location.pathname]);

  const handleItemClick = (route: string) => {
    navigate(route);
  };

  const getListItemStyles = (itemKey: string) => ({
    backgroundColor: selectedItem === itemKey ? "black" : "transparent",
    color: selectedItem === itemKey ? "white" : "inherit",
  });

  const getIconColor = (itemKey: string) =>
    selectedItem === itemKey ? "white" : "inherit";

  return (
    <CustomBox minHeight='100vh'>
      <TitleText variant="h4">ELEVATE</TitleText>

      <List>
        <SidebarItem
          handleItemClick={handleItemClick}
          getListItemStyles={getListItemStyles}
          getIconColor={getIconColor}
          selectedItem={selectedItem}
          path="/"
          icon={<PieChartOutline />}
          name="Dashboard"
        />

        <SidebarItem
          handleItemClick={handleItemClick}
          getListItemStyles={getListItemStyles}
          getIconColor={getIconColor}
          selectedItem={selectedItem}
          path="/profile"
          icon={<PersonOutline />}
          name="Profile"
        />

        <SidebarItem
          handleItemClick={handleItemClick}
          getListItemStyles={getListItemStyles}
          getIconColor={getIconColor}
          selectedItem={selectedItem}
          path="/products"
          icon={<ShoppingBagOutlined />}
          name="Manage Products"
        />

        <SidebarItem
          handleItemClick={handleItemClick}
          getListItemStyles={getListItemStyles}
          getIconColor={getIconColor}
          selectedItem={selectedItem}
          path="/settings/account"
          icon={<SettingsOutlined />}
          name="Settings"
        />

        <SidebarItem
          handleItemClick={handleItemClick}
          getListItemStyles={getListItemStyles}
          getIconColor={getIconColor}
          selectedItem={selectedItem}
          path="/logout"
          icon={<Logout />}
          name="Sign Out"
        />
      </List>
    </CustomBox>
  );
};

export default Sidebar;
