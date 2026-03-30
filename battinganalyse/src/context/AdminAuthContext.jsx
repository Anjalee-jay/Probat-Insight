import React, { createContext, useState, useEffect } from "react";
import { checkAuthStatus, login, logout } from "../services/adminAuthService";
import { getAuthToken } from "../utils/authStorage";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      checkAuthStatus(token)
        .then((status) => {
          setIsAuthenticated(status);
        })
        .catch(() => {
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const handleLogin = async (credentials) => {
    const token = await login(credentials);
    if (token) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, loading, handleLogin, handleLogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};