import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('event_app_token');
      const storedUser = localStorage.getItem('event_app_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored auth state', err);
      localStorage.removeItem('event_app_token');
      localStorage.removeItem('event_app_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      const res: AuthResponse = await api.auth.login(credentials);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('event_app_token', res.token);
      localStorage.setItem('event_app_user', JSON.stringify(res.user));
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const res: AuthResponse = await api.auth.signup(userData);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('event_app_token', res.token);
      localStorage.setItem('event_app_user', JSON.stringify(res.user));
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    setError(null);
    try {
      const res = await api.auth.updateProfile(profileData);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('event_app_token', res.token);
      localStorage.setItem('event_app_user', JSON.stringify(res.user));
    } catch (err: any) {
      setError(err.message || 'Profile update failed.');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('event_app_token');
    localStorage.removeItem('event_app_user');
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    loading,
    error,
    login,
    signup,
    updateProfile,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
