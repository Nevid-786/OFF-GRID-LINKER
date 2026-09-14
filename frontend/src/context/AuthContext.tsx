import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ein_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 1,
      name: 'Dr. Rajesh Sharma (Demo)',
      email: 'admin@ein.gov.in',
      role: 'admin'
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ein_token') || 'demo_jwt_token_ein_2026';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ein_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ein_user');
    }

    if (token) {
      localStorage.setItem('ein_token', token);
    } else {
      localStorage.removeItem('ein_token');
    }
  }, [user, token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ein_user');
    localStorage.removeItem('ein_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        role: user?.role || 'public'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
