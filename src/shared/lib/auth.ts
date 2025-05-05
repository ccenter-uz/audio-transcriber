import { jwtDecode } from 'jwt-decode';
import { createContext } from 'react';

// Define types for user roles and JWT payload
export type UserRole = 'admin' | 'transcriber';

export interface JwtPayload {
  id: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
});

// JWT token storage key
export const TOKEN_KEY = 'auth_token';

// Parse JWT token into user object
export const parseToken = (token: string): AuthUser => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    return {
      id: decoded.id,
      role: decoded.role,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Invalid token format');
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};