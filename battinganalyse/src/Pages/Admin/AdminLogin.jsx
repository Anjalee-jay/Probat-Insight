import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAuthContext } from "../../context/AdminAuthContext";
import LoginForm from "../../components/admin/LoginForm";
import adminAuthService from "../../services/adminAuthService";

export default function AdminLogin() {
  const [error, setError] = useState(null);
  const { setAdmin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const adminData = await adminAuthService.login(credentials);
      setAdmin(adminData);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="bg-[#111] p-8 rounded-3xl border border-[#42FF4E]/20">
        <h2 className="text-3xl font-bold mb-6 text-[#42FF4E]">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}