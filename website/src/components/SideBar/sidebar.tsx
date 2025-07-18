import { FC, useState, useEffect } from "react";
import { List } from "@mui/material";
import {
  Logout,
  PieChartOutline,
  PersonOutline,
  ShoppingBagOutlined,
  SettingsOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";

import { CustomBox, TitleText, SidebarItem } from "./sidebarStyles";
import { useQueryClient } from "@tanstack/react-query";

//might need some clean up also do a hover effect
const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState("");
  const queryClient = useQueryClient();
  const userRole = localStorage.getItem("userRole");

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
    <CustomBox minHeight="100vh">
      <TitleText variant="h4">ELEVATE</TitleText>

      <List>
        {userRole == "brandOwner" && (
          <SidebarItem
            handleItemClick={handleItemClick}
            getListItemStyles={getListItemStyles}
            getIconColor={getIconColor}
            selectedItem={selectedItem}
            path="/"
            icon={<PieChartOutline />}
            name="Dashboard"
          />
        )}
        {userRole == "brandOwner" && (
          <SidebarItem
            handleItemClick={handleItemClick}
            getListItemStyles={getListItemStyles}
            getIconColor={getIconColor}
            selectedItem={selectedItem}
            path="/profile"
            icon={<PersonOutline />}
            name="Profile"
          />
        )}
        <SidebarItem
          handleItemClick={handleItemClick}
          getListItemStyles={getListItemStyles}
          getIconColor={getIconColor}
          selectedItem={selectedItem}
          path="/orders/orders"
          icon={<ReceiptLongOutlined />}
          name="Orders"
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
          handleItemClick={() => {
            localStorage.clear();
            queryClient.invalidateQueries();
            navigate("/login");
          }}
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
