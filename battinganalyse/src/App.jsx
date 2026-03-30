import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import About from "./Pages/About";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ProtectedRoute from "./Pages/Admin/ProtectedRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import adminRoutes from "./routes/adminRoutes";

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Switch>
          <Route path="/" exact component={About} />
          {adminRoutes.map((route, index) => (
            <ProtectedRoute key={index} {...route} />
          ))}
        </Switch>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;