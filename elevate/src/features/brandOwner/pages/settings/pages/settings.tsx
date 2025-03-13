// src/components/Header.tsx
import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { Account } from "./account";

export const Settings: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box marginBottom={8}>
      <Box
        backgroundColor="white"
        width="95%"
        minHeight="100%"
        borderRadius="8px"
        boxShadow={3}
        padding={3}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="navigation tabs"
            variant="fullWidth"
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Account" sx={{ borderRadius: "8px" }} />
            <Tab label="Display" sx={{ borderRadius: "8px" }} />
            <Tab label="Security" sx={{ borderRadius: "8px" }} />
            <Tab label="Data" sx={{ borderRadius: "8px" }} />
            <Tab label="Subscriptions" sx={{ borderRadius: "8px" }} />
            <Tab label="Notifications" sx={{ borderRadius: "8px" }} />
          </Tabs>
        </Box>
        <Box display="flex" alignItems="center">
          {value === 0 && <Account />}
          {value === 1 && <Typography>Display Content</Typography>}
          {value === 2 && <Typography>Security Content</Typography>}
          {value === 3 && <Typography>Data Content</Typography>}
          {value === 4 && <Typography>Subscriptions Content</Typography>}
          {value === 5 && <Typography>Notifications Content</Typography>}
        </Box>
      </Box>
    </Box>
  );
};
