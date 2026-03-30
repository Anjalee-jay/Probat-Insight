import React from "react";
import { Route, Switch } from "react-router-dom";
import AdminLogin from "../Pages/Admin/AdminLogin";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import ProtectedRoute from "../Pages/Admin/ProtectedRoute";

const adminRoutes = () => {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
    </Switch>
  );
};

export default adminRoutes;