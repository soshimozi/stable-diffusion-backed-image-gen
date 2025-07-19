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
import { AuthWrapper } from './auth/AuthWrapper.tsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from './components/SnackbarContext.tsx';

const qc = new QueryClient();

const applicationThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  }
};


const applicationTheme: Theme = createTheme(applicationThemeOptions);

const config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN ?? "",
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID ?? "",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_OKTA_AUDIENCE,
    scope: "read:models create:image openid profile email"      
  },
  
}

console.log('config: ', config);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Auth0Provider {...config}>
        <Provider store={store}>
                  <SnackbarProvider>
          <AuthWrapper>
            <BrowserRouter>
              <ThemeProvider theme={applicationTheme}>
                <CssBaseline />
                <QueryClientProvider client={qc}>
                  <App />
                  </QueryClientProvider>
              </ThemeProvider>
            </BrowserRouter>
        </AuthWrapper>
                  </SnackbarProvider>
      </Provider>
    </Auth0Provider>
  </StrictMode>,
)
