// components/layout/AppSideNav.tsx
import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import ImageIcon from '@mui/icons-material/Image';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import TokenIcon from '@mui/icons-material/Token';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { useAuth0 } from "@auth0/auth0-react";

interface Props {
  drawerWidth: number;
}

const menu = [
  {
    to: "/generate",
    primary: "Generate",
    icon: <ImageIcon />
  },
  {
    to: "/models",
    primary: "Models",
    icon: <ModelTrainingIcon />
  },
  {
    to: "/workspace",
    primary: "Workspace",
    icon: <WorkspacesIcon />

  },
  {
    to: "/tokens",
    primary: "Tokens",
    icon: <TokenIcon />
  }
]

const AppSideNav: React.FC<Props> = ({ drawerWidth }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return null;
  }
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

      { /* make sure we are logged in */ }
      {isAuthenticated && (
      <List>
        {menu.map((item, index) => {
          return (
            <ListItem key={index} component={Link} to={item.to}>
            <ListItemText primary={item.primary} />
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            </ListItem>
          )
        })}
      </List>
      )}
    </Drawer>
  );
};

export default AppSideNav;
