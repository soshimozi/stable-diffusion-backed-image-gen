import { useEffect, useRef, type ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { actions } from "../store/actions";
import { Loader } from "../components/Loader";
import { dispatch } from "../store/store";


export function AuthWrapper({ children }: { children: ReactNode }) {

  const { isLoading: authLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const didFetchRef = useRef(false);

  useEffect(() => {
    
    console.log('getting token?');

    // only once, once we’re authenticated
    if (didFetchRef.current || authLoading) return;

    didFetchRef.current = true;

    (async () => {
      try {
        const token = await getAccessTokenSilently({            
            authorizationParams: {
              audience: import.meta.env.VITE_OKTA_AUDIENCE,
              scope: "read:models",
            },
        });

        dispatch(actions.appState.setAccessToken(token));

      } catch (err) {

        console.error("TokenFetcher error:", err);

      }
    })();

  }, [authLoading, isAuthenticated, getAccessTokenSilently, dispatch]);

  if (authLoading) {
    return <Loader />;
  }

  return <>{children}</>;
}
