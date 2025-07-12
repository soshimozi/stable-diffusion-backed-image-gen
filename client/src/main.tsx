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
import { createTheme, ThemeProvider, type ThemeOptions, type Theme } from '@mui/material/styles';

const applicationThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: 'Fredoka',
  },
};


const applicationTheme: Theme = createTheme(applicationThemeOptions);

console.log('domain: ', import.meta.env.VITE_AUTH0_DOMAIN);
console.log('client_id: ', import.meta.env.VITE_OKTA_CLIENT_ID)
console.log()

const config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN ?? "",
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID ?? "",
  authorizationParamters: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_OKTA_AUDIENCE,
    scope: "read:models create:image openid profile email"      
  }
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Auth0Provider {...config}>
      <BrowserRouter>
        <ThemeProvider theme={applicationTheme}>
          <CssBaseline />
          <Provider store={store}>
            <App />
          </Provider>
        </ThemeProvider>
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
