import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminAuthContext } from "../../context/AdminAuthContext";
import { useAuth } from "../../Components/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AdminAuthContext);
  const { isLoggedIn, user } = useAuth();

  return (isAuthenticated || (isLoggedIn && user?.role === "admin")) ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;