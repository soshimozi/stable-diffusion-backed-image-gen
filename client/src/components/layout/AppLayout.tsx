// components/layout/AppLayout.tsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import AppTopBar from "./AppTopBar";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader } from "../Loader";
import { ModelsService } from "../../services/ModelsService";
import { useTypedSelector } from "../../store/hooks";
import { dispatch } from "../../store/store";
import { actions } from "../../store/actions";
import type { UserProfile } from "../../types/UserProfile";


const AppLayout: React.FC = () => {
  const { isLoading, getAccessTokenSilently} = useAuth0();


  const [profile] = useState<UserProfile | undefined>(() => { 
    const saved = localStorage.getItem("profile") ?? "";

    if(!saved) {
      const profile:UserProfile = { email: "", selectedModelId: undefined};
      localStorage.setItem("profile", JSON.stringify(profile));

      return profile;
    }

    try {
      const initialValue = JSON.parse(saved);
      return initialValue;
    }
    catch(ex) {
      console.error(ex);
      return undefined;
    }
  });

  const modelsService = new ModelsService();
  const models = useTypedSelector((state) => state.model.modelList)

  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {

    if(dataLoading || isLoading || models.length > 0 || error) return;

    (async() => {

      setDataLoading(true);

      try {

        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://promptforge/api`,
            scope: "read:models",
          },
        });

        const modelList = await modelsService.getModels(accessToken);

        dispatch(actions.models.setModels(modelList));


        const modelId = profile?.selectedModelId;
        const selectedModel = modelList.find((v) => {
          return v.id === modelId;
        })

        dispatch(actions.models.setModel(selectedModel || modelList[0]));


      } catch (e: any) {
        console.error(e.message);
        setError(e.message);
      }
      finally {
        setDataLoading(false);
      }

    })();

  }, [models, dataLoading, isLoading, error]);


  if(isLoading || dataLoading) return (
    <Loader />
  )

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

      { /* <AppSideNav drawerWidth={drawerWidth} /> */}

    {/* <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Prompt Forge&trade;
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
        </Toolbar>
      </AppBar>
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

    </Box>       */}
    </Box>      


  );
};

export default AppLayout;
