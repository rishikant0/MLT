import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mlt_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const storedToken = localStorage.getItem('mlt_admin_token');
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const response: any = await api.get('/auth/me');
      if (response.success && response.data && response.data.role === 'ADMIN') {
        setUser(response.data);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = (newToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('mlt_admin_token', newToken);
    localStorage.setItem('mlt_admin_refresh_token', refreshToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('mlt_admin_token');
    localStorage.removeItem('mlt_admin_refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
