import { Box } from "@mui/material";
import React from "react";
import { Outlet } from 'react-router';
import Sidebar from "../components/SideBar/sidebar";
import { Header } from "../components/Header/header";

export default function Layout(): React.JSX.Element {
    return (
      <Box display='flex' backgroundColor="primary.main">
        <Sidebar/>
        <Box component="main" flexGrow={1}>
          <Header/>
          <Outlet/>
        </Box>
      </Box>
    );
  }