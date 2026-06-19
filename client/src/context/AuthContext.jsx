import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('taskquest_user');
    const token = localStorage.getItem('taskquest_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      connectSocket();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem('taskquest_token', data.token);
    localStorage.setItem('taskquest_user', JSON.stringify(data));
    setUser(data);
    connectSocket();
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await registerUser({ name, email, password });
    localStorage.setItem('taskquest_token', data.token);
    localStorage.setItem('taskquest_user', JSON.stringify(data));
    setUser(data);
    connectSocket();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('taskquest_token');
    localStorage.removeItem('taskquest_user');
    setUser(null);
    disconnectSocket();
  };

  // Refresh user data from localStorage (after points update etc.)
  const refreshUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    localStorage.setItem('taskquest_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
