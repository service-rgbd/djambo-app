import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api, onAuthExpired, persistStoredUser, RegisterPayload, RegisterResponse } from '../services/api';
import { disablePushNotifications } from '../services/pushNotifications';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  authToken?: string;
  sessionExpiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('fleet_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      if (parsedUser.authToken && (!parsedUser.sessionExpiresAt || new Date(parsedUser.sessionExpiresAt).getTime() > Date.now())) {
        setUser(parsedUser);
      } else {
        persistStoredUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => onAuthExpired(() => {
    setUser(null);
  }), []);

  const login = async (email: string, password: string) => {
    const authenticatedUser = await api.login(email, password);
    setUser(authenticatedUser);
    persistStoredUser(authenticatedUser);
  };

  const register = async (payload: RegisterPayload) => {
    const registration = await api.register(payload);
    setUser(null);
    persistStoredUser(null);
    return registration;
  };

  const logout = async () => {
    try {
      await disablePushNotifications().catch(() => false);
      await api.logout();
    } catch {
      // Local cleanup still applies even if the remote session is already invalid.
    }
    setUser(null);
    persistStoredUser(null);
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