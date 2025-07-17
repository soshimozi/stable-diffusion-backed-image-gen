import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { actions } from "../store/actions";
import { Loader } from "../components/Loader";
import { dispatch } from "../store/store";


export function AuthWrapper({ children }: { children: ReactNode }) {

  const { isLoading: authLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const didFetchRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // only once, once we’re authenticated
    if (didFetchRef.current || authLoading || !isAuthenticated) return;
    didFetchRef.current = true;

    (async () => {
      try {
        const token = await getAccessTokenSilently({            
            authorizationParams: {
              audience: `https://promptforge/api`,
              scope: "read:models",
            },
        });

        dispatch(actions.appState.setToken(token));

      } catch (err) {

        console.error("TokenFetcher error:", err);

      } finally {
        setReady(true);
      }
    })();

  }, [authLoading, isAuthenticated, getAccessTokenSilently, dispatch]);

  if (authLoading || !ready) {
    return <Loader />;
  }

  return <>{children}</>;
}
