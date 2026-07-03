import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authApi } from '../services/api';
import { AUTH_TOKEN_KEY } from '../utils/constants';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch (err) {
          console.error('Auth initialization failed', err);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      // In a real app, role or companyId might be passed to login API if employee
      const { user: loggedInUser } = await authApi.login(email, password, role);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
