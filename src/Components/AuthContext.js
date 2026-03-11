import React, { createContext, useContext, useState } from "react";
import { loginRequest } from "../services/authApi";

const AuthContext = createContext();

function getStoredUser() {
  const storedUser = localStorage.getItem("auth_user");
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("auth_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("auth_token") && getStoredUser()));

  const login = async (credentials = {}) => {
    if (credentials.email && credentials.password) {
      const authData = await loginRequest(credentials);
      localStorage.setItem("auth_token", authData.access_token);
      localStorage.setItem("auth_user", JSON.stringify(authData.user));
      setIsLoggedIn(true);
      setUser(authData.user);
      return authData.user;
    }

    setIsLoggedIn(true);
    setUser(credentials);
    localStorage.setItem("auth_user", JSON.stringify(credentials));
    return credentials;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
