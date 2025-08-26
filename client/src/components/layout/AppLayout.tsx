// components/layout/AppLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import AppTopBar from "./AppTopBar";


const AppLayout: React.FC = () => {

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppTopBar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: "100%", // Ensure full width of content area
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch", // Prevent centering by default
        }}
      >
        <Outlet />
      </Box>      
    </Box>      


  );
};

export default AppLayout;
