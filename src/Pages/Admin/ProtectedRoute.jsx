import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminAuthContext } from "../../context/AdminAuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AdminAuthContext);

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;