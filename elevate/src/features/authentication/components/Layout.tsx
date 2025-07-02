import { Box, Typography } from "@mui/material";
import React, { useState } from "react";

const AuthLayout: React.FC = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(165, 25, 48, 0), rgba(165, 25, 48, 0.2), rgba(165, 25, 48, 0.4))",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: 2,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        color="darkred"
        mb={10}
        mt={10}
      >
        ELEVATE
      </Typography>

      <Box
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 3,
          width: 350,
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderStyle: "solid",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
