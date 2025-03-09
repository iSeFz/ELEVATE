import { Box } from "@mui/material";
import React from "react";
import { Outlet } from 'react-router';
import Sidebar from "../components/SideBar/sidebar";
import { Header } from "../components/Header/header";

export default function Layout(): React.JSX.Element {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar/>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Header/>
          <Outlet/>
        </Box>
      </Box>
    );
  }