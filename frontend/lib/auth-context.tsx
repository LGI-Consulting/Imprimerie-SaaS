'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials } from './auth-service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (err) {
          console.error('Error loading user profile:', err);
          setError('Failed to load user profile');
          // Clear invalid token
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const userData = await authService.getProfile();
        setUser(userData);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError('An error occurred during logout');
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 