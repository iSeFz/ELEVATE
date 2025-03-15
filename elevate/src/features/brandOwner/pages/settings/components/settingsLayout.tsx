// src/brandOwner/pages/settings/pages/settings.tsx
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router";

export const Settingslayout: React.FC = () => {
  const location = useLocation();

  const tabConfig = [
    { label: "Account", value: "account" },
    { label: "Display", value: "display" },
    { label: "Security", value: "security" },
    { label: "Data", value: "data" },
    { label: "Subscriptions", value: "subscriptions" },
    { label: "Notifications", value: "notifications" },
  ];

  const currentTab = location.pathname.split("/").pop() || "account";

  return (
    <Box
      marginBottom={8}
    >
      <Box
        backgroundColor="white"
        width="95%"
        borderRadius="8px"
        boxShadow={3}
        padding={3}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab || "account"}
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
                to={`/settings/${tabItem.value}`}
                sx={{ borderRadius: "8px" }}
              />
            ))}
          </Tabs>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          // justifyContent="center"
          padding={3}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
