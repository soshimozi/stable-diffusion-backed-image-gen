// components/RequireAuth.tsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthProvider } from "../context/AuthContext";

export const RequireAuth: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [redirectPath, setRedirectPath] = useState("/login");
  const auth = useAuthProvider();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    auth.check().then((res) => {
      if (!mounted) return;

      console.log('res: ', res);
      
      if (res.authenticated) {
        setStatus("authenticated");
      } else {
        console.log('not authenticated!');
        setRedirectPath(res.redirectTo ?? "/login");
        setStatus("unauthenticated");
      }
    });

    return () => {
      mounted = false;
    };
  }, [auth]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
};
