// types/AuthProvider.ts
export interface AuthCheckResponse {
  authenticated: boolean;
  redirectTo?: string;
  logout?: boolean;
  error?: Error;
}

export interface AuthProvider {
  login: (params?: any) => Promise<{ success: boolean; redirectTo?: string }>;
  logout: (params?: any) => Promise<{ success: boolean; redirectTo?: string }>;
  check: (params?: any) => Promise<AuthCheckResponse>;
  getPermissions?: (params?: any) => Promise<any>;
  getIdentity?: () => Promise<any>;
  onError?: (error: any) => Promise<{ logout: boolean } | { error: any }>;
}
