import type { AuthProvider } from "../types/AuthProvider";

export const authProvider: AuthProvider = {
  login: async () => ({ success: true }),
  logout: async () => ({ success: true }),
  check: async () => {
    const token = localStorage.getItem("auth_token");
    return {
      authenticated: !!token,
      redirectTo: token ? undefined : "/login",
      logout: !token,
    };
  },
  getIdentity: async () => ({ name: "Jane Doe", avatar: "/avatar.png" }),
};
