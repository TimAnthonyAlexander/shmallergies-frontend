import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  allergies?: Array<{
    id: number;
    allergy_text: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<{ requiresVerification: boolean; user: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (apiClient.getToken()) {
        const response = await apiClient.getProfile();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      apiClient.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await apiClient.signup({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      // New signup flow doesn't return token, user needs to verify email first
      return {
        requiresVerification: true,
        user: response.user as User
      };
    } catch (error) {
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      await apiClient.resendVerificationEmail({ email });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isEmailVerified: !!user?.email_verified_at,
    login,
    signup,
    logout,
    refreshUser,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 