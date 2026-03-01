import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";

const fields = [
  { id: "name",     label: "Full Name",              type: "text",     placeholder: "John Doe",         optional: false },
  { id: "dob",      label: "Date of Birth",          type: "date",     placeholder: "",                 optional: false },
  { id: "gender",   label: "Gender",                 type: "select",   placeholder: "",                 optional: true,
    options: ["Male", "Female", "Other"] },
  { id: "email",    label: "Email Address",          type: "email",    placeholder: "you@example.com",  optional: false },
  { id: "phone",    label: "Phone Number",           type: "tel",      placeholder: "+94 7XXXXXXXX",    optional: true },
  { id: "password", label: "Password",               type: "password", placeholder: "••••••••",         optional: false },
  { id: "confirm",  label: "Confirm Password",       type: "password", placeholder: "••••••••",         optional: false },
];

export default function Signup() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [focused, setFocused] = useState("");

  const inputBase = `
    width: 100%;
    background: ${isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
    border: 1px solid ${isDarkMode ? "rgba(66,255,78,0.12)" : "rgba(0,0,0,0.1)"};
    border-radius: 10px;
    padding: 11px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    color: ${isDarkMode ? "#e6efe6" : "#0d120d"};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    appearance: none;
    -webkit-appearance: none;
  `;

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
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 780px;
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
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #42FF4E, #2563EB, transparent);
          border-radius: 24px 24px 0 0;
        }

        @media(max-width: 600px) { .su-card { padding: 36px 24px; } }

        /* back btn */
        .su-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #42FF4E;
          font-family: 'Barlow', sans-serif;
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
          line-height: 1;
          margin-bottom: 6px;
        }
        .su-sub {
          font-size: 13px; font-weight: 300;
          color: ${isDarkMode ? "rgba(230,239,230,0.35)" : "rgba(13,18,13,0.4)"};
          margin-bottom: 36px;
          letter-spacing: 0.02em;
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 20px;
          margin-bottom: 14px;
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
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
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
        /* date & select icon color fix */
        .su-input[type="date"] { color-scheme: ${isDarkMode ? "dark" : "light"}; }
        .su-select-wrap { position: relative; }
        .su-select-wrap::after {
          content: '';
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid ${isDarkMode ? "rgba(66,255,78,0.4)" : "rgba(13,18,13,0.3)"};
          pointer-events: none;
        }
        .su-select { padding-right: 36px; cursor: pointer;
          background-color: ${isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
        }
        .su-select option { background: ${isDarkMode ? "#0d120d" : "#fff"}; }

        /* terms */
        .su-terms {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 0 4px;
          border-top: 1px solid ${isDarkMode ? "rgba(66,255,78,0.07)" : "rgba(0,0,0,0.06)"};
          margin-top: 6px;
        }
        .su-checkbox {
          width: 18px; height: 18px;
          accent-color: #42FF4E;
          cursor: pointer; flex-shrink: 0;
        }
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

        /* bottom row */
        .su-bottom {
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          margin-top: 20px;
        }

        .su-submit {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 36px;
          background: #42FF4E;
          color: #080c08;
          border: none; border-radius: 10px;
          font-family: 'Barlow', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .su-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(66,255,78,0.3);
        }
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

          <form onSubmit={(e) => e.preventDefault()}>

            {/* Personal Info */}
            <div className="su-section-label">Personal Info</div>
            <div className="su-grid">
              {/* Full Name */}
              <div className="su-field">
                <label className={`su-label${focused === "name" ? " active" : ""}`}>Full Name</label>
                <input type="text" placeholder="John Doe" className="su-input"
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
              </div>

              {/* DOB */}
              <div className="su-field">
                <label className={`su-label${focused === "dob" ? " active" : ""}`}>Date of Birth</label>
                <input type="date" className="su-input"
                  onFocus={() => setFocused("dob")} onBlur={() => setFocused("")} />
              </div>

              {/* Gender */}
              <div className="su-field">
                <label className={`su-label${focused === "gender" ? " active" : ""}`}>
                  Gender <span className="su-optional">Optional</span>
                </label>
                <div className="su-select-wrap">
                  <select className="su-select" defaultValue=""
                    onFocus={() => setFocused("gender")} onBlur={() => setFocused("")}>
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div className="su-field">
                <label className={`su-label${focused === "phone" ? " active" : ""}`}>
                  Phone <span className="su-optional">Optional</span>
                </label>
                <input type="tel" placeholder="+94 7XXXXXXXX" className="su-input"
                  onFocus={() => setFocused("phone")} onBlur={() => setFocused("")} />
              </div>
            </div>

            {/* Account Info */}
            <div className="su-section-label" style={{ marginTop: "20px" }}>Account Info</div>
            <div className="su-grid">
              {/* Email */}
              <div className="su-field su-full">
                <label className={`su-label${focused === "email" ? " active" : ""}`}>Email Address</label>
                <input type="email" placeholder="you@example.com" className="su-input"
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
              </div>

              {/* Password */}
              <div className="su-field">
                <label className={`su-label${focused === "password" ? " active" : ""}`}>Password</label>
                <input type="password" placeholder="••••••••" className="su-input"
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")} />
              </div>

              {/* Confirm Password */}
              <div className="su-field">
                <label className={`su-label${focused === "confirm" ? " active" : ""}`}>Confirm Password</label>
                <input type="password" placeholder="••••••••" className="su-input"
                  onFocus={() => setFocused("confirm")} onBlur={() => setFocused("")} />
              </div>
            </div>

            {/* Terms */}
            <div className="su-terms">
              <input type="checkbox" id="terms" className="su-checkbox" />
              <label htmlFor="terms" className="su-terms-label">
                I agree to the <button type="button" className="su-terms-link">Terms and Conditions</button>
              </label>
            </div>

            {/* Bottom */}
            <div className="su-bottom">
              <button type="submit" className="su-submit">
                Create Account
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
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