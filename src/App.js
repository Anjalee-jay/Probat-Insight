import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Picupload from "./Pages/Picupload";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Profile from "./Pages/Profile";
import Analyzing from "./Pages/Analyzing";
import Results from "./Pages/Results";
import Drillsuggest from "./Pages/Drillsuggest";
import Notifications from "./Pages/Notifications";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import { ThemeProvider } from "./Components/ThemeContext";
import { AuthProvider } from "./Components/AuthContext";

import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>

          {/* Navbar */}
          <Navbar />

          {/* Pages */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/picupload" element={<Picupload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analyzing" element={<Analyzing />} />
            <Route path="/results" element={<Results />} />
            <Route path="/drillsuggest" element={<Drillsuggest />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>

          {/* Footer */}
          <Footer />

        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;