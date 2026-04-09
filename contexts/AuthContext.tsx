import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api, RegisterPayload, RegisterResponse } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('fleet_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const authenticatedUser = await api.login(email, password);
    setUser(authenticatedUser);
    localStorage.setItem('fleet_user', JSON.stringify(authenticatedUser));
  };

  const register = async (payload: RegisterPayload) => {
    const registration = await api.register(payload);
    setUser(null);
    localStorage.removeItem('fleet_user');
    return registration;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fleet_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};