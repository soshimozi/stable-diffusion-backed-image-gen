// components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

interface ProtectedRouteProps {
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo = "/sign-in" }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
