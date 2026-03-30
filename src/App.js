import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Picupload from "./Pages/Picupload";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ForgotPassword from "./Pages/ForgotPassword";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Profile from "./Pages/Profile";
import Analyzing from "./Pages/Analyzing";
import Results from "./Pages/Results";
import Drillsuggest from "./Pages/Drillsuggest";
import Notifications from "./Pages/Notifications";

import Dashboardlayout from "./Admin/Dashboardlayout";
import Analysis from "./Admin/Analysis";
import Users from "./Admin/Users";
import Uploads from "./Admin/Uploads";
import Reports from "./Admin/Reports";
import Settings from "./Admin/Settings";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import { ThemeProvider } from "./Components/ThemeContext";
import { AuthProvider, useAuth } from "./Components/AuthContext";

import "./index.css";

function ProtectedAdminRoute({ children }) {
  const { isLoggedIn, user } = useAuth();

  // Fallback: after login, navigate() fires before React commits state updates.
  // localStorage is written synchronously first, so use it as the authority.
  let effectiveUser = user;
  let effectiveIsLoggedIn = isLoggedIn;
  if (!isLoggedIn) {
    const token = localStorage.getItem("auth_token");
    try {
      const stored = JSON.parse(localStorage.getItem("auth_user") || "null");
      if (token && stored) {
        effectiveIsLoggedIn = true;
        effectiveUser = stored;
      }
    } catch {
      // ignore parse errors
    }
  }

  if (!effectiveIsLoggedIn || effectiveUser?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const ADMIN_ROUTES = [
  "/dashboard",
  "/analyses",
  "/users",
  "/uploads",
  "/reports",
  "/settings",
];

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/picupload" element={<Picupload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/results" element={<Results />} />
        <Route path="/drillsuggest" element={<Drillsuggest />} />
        <Route path="/notifications" element={<Notifications />} />

        <Route path="/dashboard" element={<ProtectedAdminRoute><Dashboardlayout /></ProtectedAdminRoute>} />
        <Route path="/analyses" element={<ProtectedAdminRoute><Analysis /></ProtectedAdminRoute>} />
        <Route path="/users" element={<ProtectedAdminRoute><Users /></ProtectedAdminRoute>} />
        <Route path="/uploads" element={<ProtectedAdminRoute><Uploads /></ProtectedAdminRoute>} />
        <Route path="/reports" element={<ProtectedAdminRoute><Reports /></ProtectedAdminRoute>} />
        <Route path="/settings" element={<ProtectedAdminRoute><Settings /></ProtectedAdminRoute>} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;