// context/AuthContext.tsx
import React, { createContext, useContext } from "react";
import type { AuthProvider } from "../types/AuthProvider";

const AuthProviderContext = createContext<AuthProvider | null>(null);

export const AuthProviderContextProvider: React.FC<{
  provider: AuthProvider;
  children: React.ReactNode;
}> = ({ provider, children }) => {
  return (
    <AuthProviderContext.Provider value={provider}>
      {children}
    </AuthProviderContext.Provider>
  );
};

export const useAuthProvider = (): AuthProvider => {
  const ctx = useContext(AuthProviderContext);
  if (!ctx) {
    throw new Error("useAuthProvider must be used within AuthProviderContextProvider");
  }
  return ctx;
};
