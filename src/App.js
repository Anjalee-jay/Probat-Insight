import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import About from "./Pages/About";
import Analyzing from "./Pages/Analyzing";
import Contact from "./Pages/Contact";
import Drillsuggest from "./Pages/Drillsuggest";
import ForgotPassword from "./Pages/ForgotPassword";
import Notifications from "./Pages/Notifications";
import Picupload from "./Pages/Picupload";
import Profile from "./Pages/Profile";
import Results from "./Pages/Results";

// Admin components
import AdminDashboard from "./Admin/Dashboardlayout";
import Analysis from "./Admin/Analysis";
import Reports from "./Admin/Reports";
import Settings from "./Admin/Settings";
import Uploads from "./Admin/Uploads";
import Users from "./Admin/Users";
import ProtectedRoute from "./Pages/Admin/ProtectedRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";

import { ThemeProvider } from "./Components/ThemeContext";
import { AuthProvider } from "./Components/AuthContext";
import "./index.css";

function App() {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/analyzing" element={<Analyzing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/drillsuggest" element={<Drillsuggest />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/picupload" element={<Picupload />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/results" element={<Results />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin/uploads" element={<ProtectedRoute><Uploads /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </AdminAuthProvider>

  );
}

export default App;