import { useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AuthContext, 
  TOKEN_KEY, 
  parseToken, 
  isTokenExpired, 
  AuthUser, 
  AuthContextType 
} from './auth';

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      try {
        if (!isTokenExpired(storedToken)) {
          setToken(storedToken);
          const parsedUser = parseToken(storedToken);
          setUser(parsedUser);
        } else {
          // Clear expired token
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch (error) {
        console.error('Failed to parse token:', error);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const parsedUser = parseToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(parsedUser);
    } catch (error) {
      console.error('Invalid token:', error);
      throw new Error('Invalid token format');
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}