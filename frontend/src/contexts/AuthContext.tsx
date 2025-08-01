import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token and user
    const savedToken = localStorage.getItem('educonnect_token');
    const savedUser = localStorage.getItem('educonnect_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token with backend
      verifyToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('educonnect_user', JSON.stringify(data.user));
      } else {
        // Token is invalid, clear storage
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('educonnect_user', JSON.stringify(data.user));
        localStorage.setItem('educonnect_token', data.token);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('educonnect_user');
    localStorage.removeItem('educonnect_token');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('educonnect_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}