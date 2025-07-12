// components/layout/AppTopBar.tsx
import React from "react";
import { styled, alpha } from '@mui/material/styles';
import { AppBar, Badge, Box, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, Link as MUILink } from "@mui/material";
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth0 } from "@auth0/auth0-react";
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ImageIcon from '@mui/icons-material/Image';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import TokenIcon from '@mui/icons-material/Token';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { Link } from "react-router-dom";

interface Props {
  drawerWidth: number;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

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

const AppTopBar: React.FC = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout  } = useAuth0();
 
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mailCount, setMailCount] = React.useState(0);
  const [messageCount, setMessageCount] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);


  if( isLoading ) return null;

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };  

  const handleLogout = () => {
    handleMenuClose();
    logout({logoutParams: { returnTo: window.location.origin }});
  }

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
    <AppBar
      position="fixed"
      sx={{
        userSelect: "none",
      }}
    >
      <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

        <Typography variant="h6" noWrap component="div">
          PromptForge&trade;
        </Typography>
        <Typography variant="body2" noWrap component="div" marginLeft={1}>
            forging your ideas one prompt at a time.
        </Typography>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />       

        {isAuthenticated ? ( 
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <IconButton size="large" aria-label="show 4 new mails" color="inherit">
            {mailCount > 0 ? (
            <Badge badgeContent={mailCount} color="error">
              <MailIcon />
            </Badge>
            ) : <MailIcon />}
          </IconButton>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
          >
            {messageCount > 0 ?
            (
              <Badge badgeContent={messageCount} color="error">
                <NotificationsIcon />
              </Badge>
            ) : <NotificationsIcon />
            }
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Box sx={{display: "flex"}}>
              <Box sx={{
                display: "flex",
                height: "32px",
                width: "32px",
                borderRadius: "100px",
                color: "white",
                background: "transparent",
                margin: "auto",
              }}>
                <img src={user?.picture} alt={user?.name} />
              </Box>
            </Box>
          </IconButton>
        </Box>
        ) 
        : 
        (
        <Box onClick={() => loginWithRedirect()} sx={{cursor: "pointer"}}>
          <Typography sx={{userSelect: "none"}} >Login</Typography>              
        </Box>
        )
        }
      </Toolbar>
    </AppBar>
    {renderMenu}
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    >
      <Box
        sx={{ width: 350, p: 2 }}
        role="presentation"
      >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
        {/* Add drawer content here */}
        {/* <Typography variant="h6" sx={{ mt: 2 }}>Menu</Typography> */}
        {/* Example menu items */}
      {isAuthenticated && (
      <Box sx={{display: "flex", flexDirection: "column"}}>
        {menu.map((item, index) => {
          return (
            // <Typography color="textSecondary" variant="subtitle1">Test</Typography>
              <MUILink
                href={item.to}
                key={index}
                variant="subtitle1"
                color="textSecondary"
                underline="none"
                onClick={() => {
                  console.info("I'm a button.");
                }}
              >
                <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", ml: 1, mr: 1}}>
                  {item.primary}
                  {item.icon}
                </Box>
              </MUILink>            
            // <ListItem key={index} component={Link} to={item.to} onClick={() => setDrawerOpen(false)} color="textSecondary">
            //   <Typography>Test</Typography>
            //   <ListItemIcon>
            //     {item.icon}
            //   </ListItemIcon>
            // </ListItem>
          )
        })}
      </Box>
      )}
      </Box>
    </Drawer>    
    </Box>
  );
};

export default AppTopBar;
