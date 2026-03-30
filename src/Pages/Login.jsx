import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";
import { useAuth } from "../Components/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login({ email, password });
      if (loggedInUser?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handle Create Account
  const handleCreateAccount = () => {
    navigate("/signup");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');

        .login-root {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          font-family: 'Barlow', sans-serif;
          background: #080c08;
          background-image:
            repeating-linear-gradient(90deg, rgba(66,255,78,0.035) 0px, rgba(66,255,78,0.035) 1px, transparent 1px, transparent 72px),
            repeating-linear-gradient(0deg,  rgba(66,255,78,0.035) 0px, rgba(66,255,78,0.035) 1px, transparent 1px, transparent 72px);
          position: relative;
          overflow: hidden;
        }

        .login-root.light {
          background-color: #f0f4f0;
          background-image:
            repeating-linear-gradient(90deg, rgba(66,180,78,0.06) 0px, rgba(66,180,78,0.06) 1px, transparent 1px, transparent 72px),
            repeating-linear-gradient(0deg,  rgba(66,180,78,0.06) 0px, rgba(66,180,78,0.06) 1px, transparent 1px, transparent 72px);
        }

        .login-blob-1 {
          position: absolute; top: -15%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(66,255,78,0.12) 0%, transparent 65%);
          pointer-events: none;
          animation: blobFloat 8s ease-in-out infinite;
        }
        .login-blob-2 {
          position: absolute; bottom: -15%; right: -10%;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%);
          pointer-events: none;
          animation: blobFloat 10s ease-in-out infinite reverse;
        }
        @keyframes blobFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-20px) scale(1.06); }
        }

        .login-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 900px;
          max-height: calc(100vh - 32px);
          display: grid; grid-template-columns: 1fr 1fr;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          border: 1px solid rgba(66,255,78,0.12);
          animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
          opacity: 0; transform: translateY(30px);
        }
        @keyframes cardIn { to { opacity:1; transform: translateY(0); } }
        @media(max-width: 700px) {
          .login-card { grid-template-columns: 1fr; }
          .login-left  { display: none; }
        }

        .login-left {
          background: #000; padding: 44px;
          display: flex; flex-direction: column;
          justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .login-left::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #42FF4E, transparent);
        }
        .left-ghost {
          position: absolute; bottom: -20px; left: -10px;
          font-family: 'Bebas Neue', sans-serif; font-size: 140px;
          line-height: 1; color: rgba(66,255,78,0.04);
          pointer-events: none; letter-spacing: 0.02em; white-space: nowrap;
        }
        .left-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em;
          text-transform: uppercase; color: #42FF4E; margin-bottom: 28px;
        }
        .left-eyebrow-line { display:block; width:28px; height:1px; background:#42FF4E; }
        .left-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 3.6vw, 56px);
          line-height: 0.88; color: #fff;
          letter-spacing: 0.03em; margin-bottom: 16px;
        }
        .left-title span { color: #42FF4E; display: block; }
        .left-desc {
          font-size: 14px; font-weight: 300;
          color: rgba(255,255,255,0.45); line-height: 1.8; max-width: 300px;
        }
        .left-features { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .left-feature { display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.6); }
        .feat-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #42FF4E;
          flex-shrink: 0; box-shadow: 0 0 8px rgba(66,255,78,0.6);
        }

        .login-right {
          background: #0d120d; padding: 40px 44px;
          display: flex; flex-direction: column;
          justify-content: center; position: relative; overflow-y: auto;
        }
        .login-right.light { background: #ffffff; }
        .login-right::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, #2563EB 100%);
        }

        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #42FF4E; font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; padding: 0; margin-bottom: 24px;
          opacity: 0.7; transition: opacity 0.2s; align-self: flex-start;
        }
        .back-btn:hover { opacity: 1; }
        .back-btn svg { width: 16px; height: 16px; }

        .form-heading { font-family: 'Bebas Neue', sans-serif; font-size: 40px; line-height: 1; letter-spacing: 0.04em; color: #fff; margin-bottom: 4px; }
        .form-heading.light { color: #0d120d; }
        .form-sub { font-size: 13px; font-weight: 300; color: rgba(230,239,230,0.35); margin-bottom: 24px; letter-spacing: 0.02em; }
        .form-sub.light { color: rgba(13,18,13,0.4); }

        .field-group { display: flex; flex-direction: column; gap: 14px; }
        .field-wrap { display: flex; flex-direction: column; gap: 8px; }
        .field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(230,239,230,0.4); transition: color 0.2s; }
        .field-label.active { color: #42FF4E; }
        .field-label.light { color: rgba(13,18,13,0.45); }
        .field-label.light.active { color: #16a34a; }

        .field-input-wrap { position: relative; display: flex; align-items: center; }
        .field-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(66,255,78,0.12); border-radius: 10px;
          padding: 12px 16px; color: #e6efe6;
          font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 400;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          padding-right: 44px;
        }
        .field-input::placeholder { color: rgba(230,239,230,0.2); }
        .field-input:focus {
          border-color: rgba(66,255,78,0.5);
          background: rgba(66,255,78,0.04);
          box-shadow: 0 0 0 4px rgba(66,255,78,0.06);
        }
        .field-input.light { background: #f0f4f0; border-color: rgba(0,0,0,0.1); color: #0d120d; }
        .field-input.light::placeholder { color: rgba(13,18,13,0.3); }
        .field-input.light:focus { border-color: #16a34a; background: #fff; box-shadow: 0 0 0 4px rgba(22,163,74,0.08); }

        .toggle-pass {
          position: absolute; right: 14px;
          background: none; border: none; cursor: pointer;
          color: rgba(230,239,230,0.3); display: flex; align-items: center;
          padding: 0; transition: color 0.2s;
        }
        .toggle-pass:hover { color: #42FF4E; }
        .toggle-pass.light { color: rgba(13,18,13,0.3); }
        .toggle-pass.light:hover { color: #16a34a; }

        .forgot-row { display: flex; justify-content: flex-end; margin-top: 4px; }
        .forgot-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.06em; color: rgba(66,255,78,0.5); padding: 0; transition: color 0.2s;
        }
        .forgot-btn:hover { color: #42FF4E; }

        .submit-btn {
          width: 100%; padding: 14px; border: none; border-radius: 10px;
          background: #42FF4E; color: #080c08;
          font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          margin-top: 20px; transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(66,255,78,0.3); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn svg { transition: transform 0.2s; }
        .submit-btn:hover svg { transform: translateX(4px); }

        .divider { display: flex; align-items: center; gap: 12px; margin-top: 18px; }
        .divider-line { flex: 1; height: 1px; background: rgba(66,255,78,0.1); }
        .divider-line.light { background: rgba(0,0,0,0.08); }
        .divider-text { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(230,239,230,0.2); white-space: nowrap; }
        .divider-text.light { color: rgba(13,18,13,0.25); }

        .signup-row { text-align: center; margin-top: 12px; font-size: 13px; color: rgba(230,239,230,0.3); }
        .signup-row.light { color: rgba(13,18,13,0.4); }
        .signup-link {
          color: #42FF4E; font-weight: 600; cursor: pointer;
          background: none; border: none;
          font-family: 'Barlow', sans-serif; font-size: 13px;
          padding: 0; margin-left: 4px; transition: opacity 0.2s;
          text-decoration: underline;
        }
        .signup-link:hover { opacity: 0.75; }
      `}</style>

      <div className={`login-root${!isDarkMode ? " light" : ""}`}>
        <div className="login-blob-1" />
        <div className="login-blob-2" />

        <div className="login-card">

          {/* LEFT PANEL */}
          <div className="login-left">
            <div>
              <div className="left-eyebrow">
                <span className="left-eyebrow-line" />
                Cricket Analytics
              </div>
              <h1 className="left-title">
                Master
                <span>Your</span>
                Technique.
              </h1>
              <p className="left-desc">
                AI-powered batting analysis that gives you the feedback
                professionals pay thousands for — in seconds.
              </p>
              <div className="left-features">
                {["Pose detection", "Sub-degree angle precision", "Instant drill suggestions"].map((f, i) => (
                  <div className="left-feature" key={i}>
                    <span className="feat-dot" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={`login-right${!isDarkMode ? " light" : ""}`}>

            <button className="back-btn" onClick={() => navigate("/")} aria-label="Go to Home">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </button>

            <h2 className={`form-heading${!isDarkMode ? " light" : ""}`}>Welcome Back</h2>
            <p className={`form-sub${!isDarkMode ? " light" : ""}`}>Sign in to continue your training</p>

            {/* ✅ onSubmit calls handleSignIn */}
            <form className="field-group" onSubmit={handleSignIn}>

              <div className="field-wrap">
                <label className={`field-label${focused === "email" ? " active" : ""}${!isDarkMode ? " light" : ""}`}>
                  Email Address
                </label>
                <div className="field-input-wrap">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`field-input${!isDarkMode ? " light" : ""}`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                  />
                </div>
              </div>

              <div className="field-wrap">
                <label className={`field-label${focused === "pass" ? " active" : ""}${!isDarkMode ? " light" : ""}`}>
                  Password
                </label>
                <div className="field-input-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className={`field-input${!isDarkMode ? " light" : ""}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    onFocus={() => setFocused("pass")}
                    onBlur={() => setFocused("")}
                  />
                  <button
                    type="button"
                    className={`toggle-pass${!isDarkMode ? " light" : ""}`}
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="forgot-row">
                  <button type="button" className="forgot-btn" onClick={() => navigate("/forgot-password")}>Forgot password?</button>
                </div>
              </div>

              {errorMessage && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errorMessage}</p>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In"}
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

            </form>

            <div className="divider">
              <span className={`divider-line${!isDarkMode ? " light" : ""}`} />
              <span className={`divider-text${!isDarkMode ? " light" : ""}`}>New to ProBat?</span>
              <span className={`divider-line${!isDarkMode ? " light" : ""}`} />
            </div>

            <p className={`signup-row${!isDarkMode ? " light" : ""}`}>
              Don't have an account?
              {/* ✅ navigates to /signup */}
              <button className="signup-link" type="button" onClick={handleCreateAccount}>
                Create an Account
              </button>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
