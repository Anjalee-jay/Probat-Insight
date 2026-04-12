import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";
import { registerRequest } from "../services/authApi";

export default function Signup() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [focused, setFocused] = useState("");
  const [avatar, setAvatar] = useState(null);       // base64 preview
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    dob: "",
    gender: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s]{10,15}$/;

  // ── handle file selection (input or drag) ──
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatar(e.target.result);
    reader.readAsDataURL(file);
  };

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const removeAvatar = (e) => {
    e.stopPropagation();
    setAvatar(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const validateField = (name, value, nextFormData = formData, nextTermsAccepted = termsAccepted) => {
    switch (name) {
      case "name": {
        const trimmedName = value.trim();
        if (!trimmedName) {
          return "Full name is required.";
        }
        if (trimmedName.length < 2) {
          return "Full name must be at least 2 characters.";
        }
        return "";
      }
      case "email": {
        const rawEmail = value.trim();
        const normalizedEmail = rawEmail.toLowerCase();
        if (!normalizedEmail) {
          return "Email is required.";
        }
        if (!emailRegex.test(normalizedEmail)) {
          return "Please enter a valid email address.";
        }
        if (rawEmail !== normalizedEmail) {
          return "Email must be in lowercase letters only.";
        }
        return "";
      }
      case "password": {
        if (!value) {
          return "Password is required.";
        }
        if (value.length < 8 || value.length > 72) {
          return "Password must be between 8 and 72 characters.";
        }
        if (value.trim() !== value) {
          return "Password cannot start or end with spaces.";
        }
        if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
          return "Password must include at least one letter and one number.";
        }
        return "";
      }
      case "confirm": {
        if (!value) {
          return "Please confirm your password.";
        }
        if (nextFormData.password !== value) {
          return "Passwords do not match.";
        }
        return "";
      }
      case "dob": {
        if (!value) {
          return "Date of birth is required.";
        }
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          return "Date of birth cannot be in the future.";
        }
        return "";
      }
      case "phone": {
        if (value && !phoneRegex.test(value.trim())) {
          return "Phone must contain 10 to 15 digits.";
        }
        return "";
      }
      case "terms": {
        if (!nextTermsAccepted) {
          return "You must accept the Terms and Conditions.";
        }
        return "";
      }
      default:
        return "";
    }
  };

  // ── Form handlers ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = { ...formData, [name]: value };
    const nextFieldErrors = {
      ...fieldErrors,
      [name]: validateField(name, value, nextFormData),
    };

    if (name === "password" || name === "confirm") {
      nextFieldErrors.confirm = validateField("confirm", nextFormData.confirm, nextFormData);
    }

    setFormData(nextFormData);
    setError("");
    setFieldErrors(nextFieldErrors);
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setFocused("");
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  const handleTermsChange = (e) => {
    const checked = e.target.checked;
    setTermsAccepted(checked);
    setError("");
    setFieldErrors((prev) => ({
      ...prev,
      terms: validateField("terms", "", formData, checked),
    }));
  };

  const validateForm = () => {
    const trimmedName = formData.name.trim();
    const rawEmail = formData.email.trim();
    const normalizedEmail = rawEmail.toLowerCase();

    const errors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirm: validateField("confirm", formData.confirm, formData),
      dob: validateField("dob", formData.dob),
      phone: validateField("phone", formData.phone),
      terms: validateField("terms", "", formData, termsAccepted),
    };

    Object.keys(errors).forEach((key) => {
      if (!errors[key]) {
        delete errors[key];
      }
    });

    return { errors, normalizedEmail, trimmedName };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { errors, normalizedEmail, trimmedName } = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        email: normalizedEmail,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender || null,
        phone: formData.phone.trim() || null,
        avatar: avatar,
        role: "user",
      };

      const response = await registerRequest(payload);
      
      // Store token if registration successful
      if (response.access_token) {
        localStorage.setItem("auth_token", response.access_token);
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      const nextFieldErrors = { ...(err.fieldErrors || {}) };
      const fallbackMessage = err.message || "Failed to create account. Please try again.";

      if (!Object.keys(nextFieldErrors).length && fallbackMessage.toLowerCase().includes("email already exists")) {
        nextFieldErrors.email = fallbackMessage;
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...nextFieldErrors }));
        setError("Please fix the highlighted fields.");
      } else {
        setError(fallbackMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');

        .signup-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          font-family: 'Barlow', sans-serif;
          background: ${isDarkMode ? "#080c08" : "#f0f4f0"};
          background-image:
            repeating-linear-gradient(90deg, ${isDarkMode ? "rgba(66,255,78,0.03)" : "rgba(66,180,78,0.05)"} 0px, ${isDarkMode ? "rgba(66,255,78,0.03)" : "rgba(66,180,78,0.05)"} 1px, transparent 1px, transparent 72px),
            repeating-linear-gradient(0deg,  ${isDarkMode ? "rgba(66,255,78,0.03)" : "rgba(66,180,78,0.05)"} 0px, ${isDarkMode ? "rgba(66,255,78,0.03)" : "rgba(66,180,78,0.05)"} 1px, transparent 1px, transparent 72px);
          position: relative;
          overflow: hidden;
        }

        .su-blob-1 {
          position: fixed; top: -15%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(66,255,78,0.1) 0%, transparent 65%);
          pointer-events: none;
          animation: blobF 9s ease-in-out infinite;
        }
        .su-blob-2 {
          position: fixed; bottom: -15%; right: -10%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%);
          pointer-events: none;
          animation: blobF 11s ease-in-out infinite reverse;
        }
        @keyframes blobF {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(16px,-16px) scale(1.06); }
        }

        /* card */
        .su-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 780px;
          background: ${isDarkMode ? "#0d120d" : "#ffffff"};
          border: 1px solid ${isDarkMode ? "rgba(66,255,78,0.14)" : "rgba(0,0,0,0.08)"};
          border-radius: 24px;
          padding: 48px 52px;
          box-shadow: 0 40px 90px rgba(0,0,0,${isDarkMode ? "0.5" : "0.12"});
          animation: cardIn 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
          opacity: 0; transform: translateY(24px);
        }
        @keyframes cardIn { to { opacity:1; transform:translateY(0); } }
        .su-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #42FF4E, #2563EB, transparent);
          border-radius: 24px 24px 0 0;
        }
        @media(max-width: 600px) { .su-card { padding: 36px 24px; } }

        /* back */
        .su-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #42FF4E; font-family: 'Barlow', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          padding: 0; margin-bottom: 28px;
          opacity: 0.7; transition: opacity 0.2s;
        }
        .su-back:hover { opacity: 1; }
        .su-back svg { width: 15px; height: 15px; }

        /* heading */
        .su-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          letter-spacing: 0.04em;
          color: ${isDarkMode ? "#fff" : "#0d120d"};
          line-height: 1; margin-bottom: 6px;
        }
        .su-sub {
          font-size: 13px; font-weight: 300;
          color: ${isDarkMode ? "rgba(230,239,230,0.35)" : "rgba(13,18,13,0.4)"};
          margin-bottom: 36px; letter-spacing: 0.02em;
        }

        /* section label */
        .su-section-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: ${isDarkMode ? "rgba(66,255,78,0.5)" : "rgba(22,163,74,0.6)"};
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .su-section-label::after {
          content: ''; flex: 1; height: 1px;
          background: ${isDarkMode ? "rgba(66,255,78,0.1)" : "rgba(0,0,0,0.07)"};
        }

        /* grid */
        .su-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 14px 20px; margin-bottom: 14px;
        }
        @media(max-width: 560px) { .su-grid { grid-template-columns: 1fr; } }
        .su-full { grid-column: 1 / -1; }

        /* field */
        .su-field { display: flex; flex-direction: column; gap: 6px; }
        .su-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: ${isDarkMode ? "rgba(230,239,230,0.35)" : "rgba(13,18,13,0.4)"};
          display: flex; align-items: center; gap: 6px;
          transition: color 0.2s;
        }
        .su-label.active { color: #42FF4E; }
        .su-optional {
          font-size: 9px; font-weight: 500; letter-spacing: 0.08em;
          color: ${isDarkMode ? "rgba(230,239,230,0.2)" : "rgba(13,18,13,0.25)"};
          text-transform: uppercase;
        }

        .su-input, .su-select {
          width: 100%;
          background: ${isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
          border: 1px solid ${isDarkMode ? "rgba(66,255,78,0.12)" : "rgba(0,0,0,0.1)"};
          border-radius: 10px; padding: 11px 14px;
          font-family: 'Barlow', sans-serif; font-size: 14px;
          color: ${isDarkMode ? "#e6efe6" : "#0d120d"};
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          appearance: none; -webkit-appearance: none;
        }
        .su-input::placeholder { color: ${isDarkMode ? "rgba(230,239,230,0.2)" : "rgba(13,18,13,0.25)"}; }
        .su-input:focus, .su-select:focus {
          border-color: rgba(66,255,78,0.5);
          background: ${isDarkMode ? "rgba(66,255,78,0.04)" : "rgba(66,255,78,0.03)"};
          box-shadow: 0 0 0 3px rgba(66,255,78,0.07);
        }
        .su-input[type="date"] { color-scheme: ${isDarkMode ? "dark" : "light"}; }
        .su-select-wrap { position: relative; }
        .su-select-wrap::after {
          content: ''; position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); width: 0; height: 0;
          border-left: 4px solid transparent; border-right: 4px solid transparent;
          border-top: 5px solid ${isDarkMode ? "rgba(66,255,78,0.4)" : "rgba(13,18,13,0.3)"};
          pointer-events: none;
        }
        .su-select { padding-right: 36px; cursor: pointer;
          background-color: ${isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
        }
        .su-select option { background: ${isDarkMode ? "#0d120d" : "#fff"}; }

        /* ── AVATAR UPLOADER ── */
        .avatar-uploader {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 18px 20px;
          border-radius: 14px;
          margin-bottom: 24px;
          transition: border-color 0.2s, background 0.2s;
          border: 1px dashed ${isDarkMode ? "rgba(66,255,78,0.2)" : "rgba(0,0,0,0.12)"};
          background: ${isDarkMode ? "rgba(66,255,78,0.03)" : "rgba(66,180,78,0.03)"};
          cursor: pointer;
        }
        .avatar-uploader.drag-over {
          border-color: rgba(66,255,78,0.6) !important;
          background: rgba(66,255,78,0.07) !important;
          box-shadow: 0 0 0 4px rgba(66,255,78,0.07);
        }
        .avatar-uploader:hover {
          border-color: rgba(66,255,78,0.4);
          background: ${isDarkMode ? "rgba(66,255,78,0.05)" : "rgba(66,180,78,0.06)"};
        }

        /* avatar preview circle */
        .avatar-circle {
          width: 72px; height: 72px;
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(66,255,78,0.25);
          background: ${isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s;
        }
        .avatar-circle:hover { border-color: rgba(66,255,78,0.6); }

        .avatar-circle img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .avatar-placeholder-icon {
          color: ${isDarkMode ? "rgba(66,255,78,0.35)" : "rgba(66,150,78,0.4)"};
        }

        /* overlay on hover when image exists */
        .avatar-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
          border-radius: 50%;
        }
        .avatar-circle:hover .avatar-overlay { opacity: 1; }

        .avatar-text-wrap { flex: 1; }
        .avatar-title {
          font-size: 13px; font-weight: 600;
          color: ${isDarkMode ? "rgba(255,255,255,0.75)" : "rgba(13,18,13,0.75)"};
          margin-bottom: 3px;
        }
        .avatar-hint {
          font-size: 11px;
          color: ${isDarkMode ? "rgba(255,255,255,0.28)" : "rgba(13,18,13,0.35)"};
          line-height: 1.5;
        }

        .avatar-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }

        .btn-upload {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          font-family: 'Barlow', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
          background: rgba(66,255,78,0.1);
          color: #42FF4E;
          border: 1px solid rgba(66,255,78,0.25);
        }
        .btn-upload:hover {
          background: rgba(66,255,78,0.16);
          border-color: rgba(66,255,78,0.5);
          box-shadow: 0 0 12px rgba(66,255,78,0.15);
        }

        .btn-remove {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 8px;
          font-family: 'Barlow', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
          background: rgba(255,61,113,0.07);
          color: rgba(255,100,100,0.65);
          border: 1px solid rgba(255,80,80,0.15);
        }
        .btn-remove:hover {
          background: rgba(255,61,113,0.12);
          color: #ff6b6b;
          border-color: rgba(255,80,80,0.35);
        }

        /* badge on avatar: "✓ Set" */
        .avatar-badge {
          position: absolute; bottom: -2px; right: -2px;
          width: 22px; height: 22px; border-radius: 50%;
          background: #42FF4E;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid ${isDarkMode ? "#0d120d" : "#fff"};
          animation: badgePop 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes badgePop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* terms */
        .su-terms {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 0 4px;
          border-top: 1px solid ${isDarkMode ? "rgba(66,255,78,0.07)" : "rgba(0,0,0,0.06)"};
          margin-top: 6px;
        }
        .su-checkbox { width: 18px; height: 18px; accent-color: #42FF4E; cursor: pointer; flex-shrink: 0; }
        .su-terms-label {
          font-size: 13px; font-weight: 400;
          color: ${isDarkMode ? "rgba(230,239,230,0.45)" : "rgba(13,18,13,0.5)"};
        }
        .su-terms-link {
          color: #42FF4E; font-weight: 600; cursor: pointer;
          background: none; border: none;
          font-family: 'Barlow', sans-serif; font-size: 13px;
          padding: 0; transition: opacity 0.2s;
        }
        .su-terms-link:hover { opacity: 0.7; }

        /* bottom */
        .su-bottom {
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-top: 20px;
        }
        .su-submit {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 36px; background: #42FF4E; color: #080c08;
          border: none; border-radius: 10px;
          font-family: 'Barlow', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .su-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(66,255,78,0.3); }
        .su-submit svg { transition: transform 0.2s; }
        .su-submit:hover svg { transform: translateX(4px); }

        .su-login-row {
          font-size: 13px;
          color: ${isDarkMode ? "rgba(230,239,230,0.3)" : "rgba(13,18,13,0.4)"};
        }
        .su-login-link {
          color: #42FF4E; font-weight: 600; cursor: pointer;
          background: none; border: none;
          font-family: 'Barlow', sans-serif; font-size: 13px;
          padding: 0; margin-left: 4px; transition: opacity 0.2s;
        }
        .su-login-link:hover { opacity: 0.7; }
      `}</style>

      <div className="signup-root">
        <div className="su-blob-1" />
        <div className="su-blob-2" />

        <div className="su-card">

          {/* Back */}
          <button className="su-back" onClick={() => navigate("/")} aria-label="Go to Home">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </button>

          {/* Heading */}
          <h2 className="su-heading">Create Account</h2>
          <p className="su-sub">Join thousands of players improving with AI</p>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "rgba(255, 61, 113, 0.1)",
              border: "1px solid rgba(255, 61, 113, 0.3)",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "20px",
              color: "#ff6b6b",
              fontSize: "13px",
              fontWeight: "500",
            }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              background: "rgba(66, 255, 78, 0.1)",
              border: "1px solid rgba(66, 255, 78, 0.3)",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "20px",
              color: "#42FF4E",
              fontSize: "13px",
              fontWeight: "500",
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── PROFILE PICTURE UPLOADER ── */}
            <div className="su-section-label">Profile Picture</div>

            {/* hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onFileChange}
            />

            <div
              className={`avatar-uploader${dragOver ? " drag-over" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              {/* Circle preview */}
              <div className="avatar-circle">
                {avatar ? (
                  <>
                    <img src={avatar} alt="Profile preview" />
                    <div className="avatar-overlay">
                      <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.95l-3.414.95.95-3.414A4 4 0 019 13z" />
                      </svg>
                    </div>
                    {/* green tick badge */}
                    <div className="avatar-badge">
                      <svg width="10" height="10" fill="none" stroke="#080c08" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <svg className="avatar-placeholder-icon" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              {/* Text */}
              <div className="avatar-text-wrap">
                <p className="avatar-title">
                  {avatar ? "Profile picture set" : "Upload profile picture"}
                </p>
                <p className="avatar-hint">
                  {avatar
                    ? "Click the photo to change it, or drag a new one here"
                    : "Drag & drop or click to browse · JPG, PNG, WEBP · Max 5MB"}
                </p>
              </div>

              {/* Action buttons */}
              <div
                className="avatar-actions"
                onClick={(e) => e.stopPropagation()} // prevent double-trigger on card click
              >
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => fileRef.current?.click()}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {avatar ? "Change" : "Browse"}
                </button>

                {avatar && (
                  <button type="button" className="btn-remove" onClick={removeAvatar}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className="su-section-label">Personal Info</div>
            <div className="su-grid">
              <div className="su-field">
                <label className={`su-label${focused === "name" ? " active" : ""}`}>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="John Doe" 
                  className="su-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("name")} 
                  onBlur={handleFieldBlur} 
                />
                {fieldErrors.name && <small style={{ color: "#ff6b6b", fontSize: "12px" }}>{fieldErrors.name}</small>}
              </div>
              <div className="su-field">
                <label className={`su-label${focused === "dob" ? " active" : ""}`}>Date of Birth</label>
                <input 
                  type="date" 
                  name="dob"
                  className="su-input"
                  value={formData.dob}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("dob")} 
                  onBlur={handleFieldBlur} 
                />
                {fieldErrors.dob && <small style={{ color: "#ff6b6b", fontSize: "12px" }}>{fieldErrors.dob}</small>}
              </div>
              <div className="su-field">
                <label className={`su-label${focused === "gender" ? " active" : ""}`}>
                  Gender <span className="su-optional">Optional</span>
                </label>
                <div className="su-select-wrap">
                  <select 
                    name="gender"
                    className="su-select" 
                    value={formData.gender}
                    onChange={handleInputChange}
                    onFocus={() => setFocused("gender")} 
                    onBlur={handleFieldBlur}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="su-field">
                <label className={`su-label${focused === "phone" ? " active" : ""}`}>
                  Phone <span className="su-optional">Optional</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="+94 7XXXXXXXX" 
                  className="su-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("phone")} 
                  onBlur={handleFieldBlur} 
                />
                {fieldErrors.phone && <small style={{ color: "#ff6b6b", fontSize: "12px" }}>{fieldErrors.phone}</small>}
              </div>
            </div>

            {/* Account Info */}
            <div className="su-section-label" style={{ marginTop: "20px" }}>Account Info</div>
            <div className="su-grid">
              <div className="su-field su-full">
                <label className={`su-label${focused === "email" ? " active" : ""}`}>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="you@example.com" 
                  className="su-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("email")} 
                  onBlur={handleFieldBlur} 
                />
                {fieldErrors.email && <small style={{ color: "#ff6b6b", fontSize: "12px" }}>{fieldErrors.email}</small>}
              </div>
              <div className="su-field">
                <label className={`su-label${focused === "password" ? " active" : ""}`}>Password</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  className="su-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("password")} 
                  onBlur={handleFieldBlur} 
                />
                {fieldErrors.password && <small style={{ color: "#ff6b6b", fontSize: "12px" }}>{fieldErrors.password}</small>}
              </div>
              <div className="su-field">
                <label className={`su-label${focused === "confirm" ? " active" : ""}`}>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirm"
                  placeholder="••••••••" 
                  className="su-input"
                  value={formData.confirm}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("confirm")} 
                  onBlur={handleFieldBlur} 
                />
                {fieldErrors.confirm && <small style={{ color: "#ff6b6b", fontSize: "12px" }}>{fieldErrors.confirm}</small>}
              </div>
            </div>

            {/* Terms */}
            <div className="su-terms">
              <input 
                type="checkbox" 
                id="terms" 
                className="su-checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
              />
              <label htmlFor="terms" className="su-terms-label">
                I agree to the <button type="button" className="su-terms-link">Terms and Conditions</button>
              </label>
            </div>
            {fieldErrors.terms && <small style={{ color: "#ff6b6b", fontSize: "12px" }}>{fieldErrors.terms}</small>}

            {/* Bottom */}
            <div className="su-bottom">
              <button 
                type="submit" 
                className="su-submit"
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              <p className="su-login-row">
                Already have an account?
                <button type="button" className="su-login-link" onClick={() => navigate("/login")}>
                  Sign In
                </button>
              </p>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
