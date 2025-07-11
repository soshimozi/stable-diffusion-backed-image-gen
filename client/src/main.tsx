import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router";

import { store } from "./store/store.ts";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { CssBaseline } from '@mui/material';

import App from './App.tsx'
import { Provider } from 'react-redux';

const domain = process.env.OKTA_DOMAIN

const config = {
  domain: process.env.OKTA_DOMAIN ?? "",
  clientId: process.env.OKTA_CLIENT_ID ?? "",
  authorizationParamters: {
    redirect_uri: window.location.origin,
    audience: process.env.OKTA_AUDIENCE,
    scope: "read:models create:image openid profile email"      
  }
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Auth0Provider {...config}>
      <BrowserRouter>
        {/* <ThemeProvider theme={darkTheme}> */}
          <CssBaseline />
          <Provider store={store}>
            <App />
          </Provider>
        {/* </ThemeProvider> */}
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
