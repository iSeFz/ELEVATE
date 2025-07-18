// src/brandOwner/pages/settings/pages/settings.tsx
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router";

export const OrdersLayout: React.FC = () => {
  const location = useLocation();

  const tabConfig = [
    { label: "Orders", value: "orders" },
    { label: "Refunds", value: "refunds" },
  ];

  const getActiveTab = () => {
    const pathSegments = location.pathname.split("/");
    const settingsIndex = pathSegments.indexOf("orders");

    if (settingsIndex !== -1 && pathSegments[settingsIndex + 1]) {
      const tabValue = pathSegments[settingsIndex + 1];
      if (tabConfig.some((tab) => tab.value === tabValue)) {
        return tabValue;
      }
    }

    return "orders";
  };

  const currentTab = getActiveTab();

  return (
    <Box marginBottom={8}>
      <Box
        backgroundColor="white"
        width="95%"
        borderRadius="8px"
        boxShadow={3}
        padding={3}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            variant="fullWidth"
            textColor="secondary"
            indicatorColor="secondary"
          >
            {tabConfig.map((tabItem) => (
              <Tab
                key={tabItem.value}
                label={tabItem.label}
                value={tabItem.value}
                component={Link}
                to={`/orders/${tabItem.value}`}
                sx={{ borderRadius: "8px" }}
              />
            ))}
          </Tabs>
        </Box>
        <Box display="flex" alignItems="center" padding={3}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
