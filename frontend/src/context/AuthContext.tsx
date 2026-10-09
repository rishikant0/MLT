import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getActiveAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getActiveAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      const activeToken = getActiveAuthToken();
      if (!activeToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      const response: any = await api.get('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
        setToken(activeToken);
      } else {
        const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        if (isAdminPath) {
          localStorage.removeItem('mlt_admin_token');
          localStorage.removeItem('mlt_admin_refresh_token');
        } else {
          localStorage.removeItem('mlt_student_token');
          localStorage.removeItem('mlt_student_refresh_token');
          localStorage.removeItem('mlt_token');
          localStorage.removeItem('mlt_refresh_token');
        }
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      if (isAdminPath) {
        localStorage.removeItem('mlt_admin_token');
        localStorage.removeItem('mlt_admin_refresh_token');
      } else {
        localStorage.removeItem('mlt_student_token');
        localStorage.removeItem('mlt_student_refresh_token');
        localStorage.removeItem('mlt_token');
        localStorage.removeItem('mlt_refresh_token');
      }
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = (newToken: string, refreshToken: string, userData: User) => {
    if (userData.role === 'ADMIN') {
      localStorage.setItem('mlt_admin_token', newToken);
      localStorage.setItem('mlt_admin_refresh_token', refreshToken);
    } else {
      localStorage.setItem('mlt_student_token', newToken);
      localStorage.setItem('mlt_student_refresh_token', refreshToken);
      localStorage.setItem('mlt_token', newToken);
      localStorage.setItem('mlt_refresh_token', refreshToken);
    }

    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdminPath || user?.role === 'ADMIN') {
      localStorage.removeItem('mlt_admin_token');
      localStorage.removeItem('mlt_admin_refresh_token');
    } else {
      localStorage.removeItem('mlt_student_token');
      localStorage.removeItem('mlt_student_refresh_token');
      localStorage.removeItem('mlt_token');
      localStorage.removeItem('mlt_refresh_token');
    }
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loading: isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
