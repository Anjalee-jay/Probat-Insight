import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";
import { forgotPasswordRequest } from "../services/authApi";
import Layout from "../Components/Layout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await forgotPasswordRequest(email.trim());
      setSent(true);
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');

        .fp-root {
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
        .fp-root.light {
          background-color: #f0f4f0;
          background-image:
            repeating-linear-gradient(90deg, rgba(66,180,78,0.06) 0px, rgba(66,180,78,0.06) 1px, transparent 1px, transparent 72px),
            repeating-linear-gradient(0deg,  rgba(66,180,78,0.06) 0px, rgba(66,180,78,0.06) 1px, transparent 1px, transparent 72px);
        }

        .fp-blob-1 {
          position: absolute; top: -15%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(66,255,78,0.12) 0%, transparent 65%);
          pointer-events: none;
          animation: fpBlobFloat 8s ease-in-out infinite;
        }
        .fp-blob-2 {
          position: absolute; bottom: -15%; right: -10%;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%);
          pointer-events: none;
          animation: fpBlobFloat 10s ease-in-out infinite reverse;
        }
        @keyframes fpBlobFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-20px) scale(1.06); }
        }

        .fp-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 900px;
          display: grid; grid-template-columns: 1fr 1fr;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          border: 1px solid rgba(66,255,78,0.12);
          animation: fpCardIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
          opacity: 0; transform: translateY(30px);
        }
        @keyframes fpCardIn { to { opacity:1; transform: translateY(0); } }
        @media(max-width: 700px) {
          .fp-card { grid-template-columns: 1fr; }
          .fp-left  { display: none; }
        }

        /* ── LEFT PANEL ── */
        .fp-left {
          background: #000; padding: 44px;
          display: flex; flex-direction: column;
          justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .fp-left::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #42FF4E, transparent);
        }
        .fp-left-ghost {
          position: absolute; bottom: -20px; left: -10px;
          font-family: 'Bebas Neue', sans-serif; font-size: 140px;
          line-height: 1; color: rgba(66,255,78,0.04);
          pointer-events: none; letter-spacing: 0.02em; white-space: nowrap;
        }
        .fp-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em;
          text-transform: uppercase; color: #42FF4E; margin-bottom: 28px;
        }
        .fp-eyebrow-line { display:block; width:28px; height:1px; background:#42FF4E; }
        .fp-left-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 3.6vw, 56px);
          line-height: 0.88; color: #fff;
          letter-spacing: 0.03em; margin-bottom: 16px;
        }
        .fp-left-title span { color: #42FF4E; display: block; }
        .fp-left-desc {
          font-size: 14px; font-weight: 300;
          color: rgba(255,255,255,0.45); line-height: 1.8; max-width: 300px;
        }
        .fp-left-features { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .fp-left-feature { display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.6); }
        .fp-feat-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #42FF4E;
          flex-shrink: 0; box-shadow: 0 0 8px rgba(66,255,78,0.6);
        }

        /* ── RIGHT PANEL ── */
        .fp-right {
          background: #0d120d; padding: 40px 44px;
          display: flex; flex-direction: column;
          justify-content: center; position: relative; overflow-y: auto;
        }
        .fp-right.light { background: #ffffff; }
        .fp-right::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, #2563EB 100%);
        }

        .fp-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #42FF4E; font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; padding: 0; margin-bottom: 28px;
          opacity: 0.7; transition: opacity 0.2s; align-self: flex-start;
        }
        .fp-back-btn:hover { opacity: 1; }

        .fp-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(66,255,78,0.08);
          border: 1px solid rgba(66,255,78,0.18);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .fp-icon-wrap.light { background: rgba(22,163,74,0.08); border-color: rgba(22,163,74,0.2); }

        .fp-heading {
          font-family: 'Bebas Neue', sans-serif; font-size: 42px;
          line-height: 1; letter-spacing: 0.04em; color: #fff; margin-bottom: 6px;
        }
        .fp-heading.light { color: #0d120d; }
        .fp-sub {
          font-size: 13px; font-weight: 300;
          color: rgba(230,239,230,0.35); margin-bottom: 28px; line-height: 1.7;
        }
        .fp-sub.light { color: rgba(13,18,13,0.4); }

        .fp-field-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .fp-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(230,239,230,0.4); transition: color 0.2s;
        }
        .fp-label.active { color: #42FF4E; }
        .fp-label.light { color: rgba(13,18,13,0.45); }
        .fp-label.light.active { color: #16a34a; }

        .fp-input-wrap { position: relative; display: flex; align-items: center; }
        .fp-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(66,255,78,0.12); border-radius: 10px;
          padding: 13px 16px 13px 44px;
          color: #e6efe6; font-family: 'Barlow', sans-serif;
          font-size: 14px; font-weight: 400;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .fp-input::placeholder { color: rgba(230,239,230,0.2); }
        .fp-input:focus {
          border-color: rgba(66,255,78,0.5);
          background: rgba(66,255,78,0.04);
          box-shadow: 0 0 0 4px rgba(66,255,78,0.06);
        }
        .fp-input.light { background: #f0f4f0; border-color: rgba(0,0,0,0.1); color: #0d120d; }
        .fp-input.light::placeholder { color: rgba(13,18,13,0.3); }
        .fp-input.light:focus { border-color: #16a34a; background: #fff; box-shadow: 0 0 0 4px rgba(22,163,74,0.08); }

        .fp-input-icon {
          position: absolute; left: 14px;
          color: rgba(66,255,78,0.4); pointer-events: none;
          display: flex; align-items: center;
        }
        .fp-input-icon.light { color: rgba(13,18,13,0.3); }

        .fp-submit-btn {
          width: 100%; padding: 14px; border: none; border-radius: 10px;
          background: #42FF4E; color: #080c08;
          font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .fp-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(66,255,78,0.3); }
        .fp-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .fp-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .fp-divider { display: flex; align-items: center; gap: 12px; margin-top: 20px; }
        .fp-divider-line { flex: 1; height: 1px; background: rgba(66,255,78,0.1); }
        .fp-divider-line.light { background: rgba(0,0,0,0.08); }
        .fp-divider-text { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(230,239,230,0.2); white-space: nowrap; }
        .fp-divider-text.light { color: rgba(13,18,13,0.25); }

        .fp-login-row { text-align: center; margin-top: 14px; font-size: 13px; color: rgba(230,239,230,0.3); }
        .fp-login-row.light { color: rgba(13,18,13,0.4); }
        .fp-login-link {
          color: #42FF4E; font-weight: 600; cursor: pointer;
          background: none; border: none;
          font-family: 'Barlow', sans-serif; font-size: 13px;
          padding: 0; margin-left: 4px; transition: opacity 0.2s;
          text-decoration: underline;
        }
        .fp-login-link:hover { opacity: 0.75; }

        /* ── SUCCESS STATE ── */
        .fp-success {
          display: flex; flex-direction: column; align-items: flex-start; gap: 0;
          animation: fpSuccessIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes fpSuccessIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .fp-success-icon {
          width: 60px; height: 60px; border-radius: 16px;
          background: rgba(66,255,78,0.1); border: 1px solid rgba(66,255,78,0.25);
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
        }
        .fp-success-icon.light { background: rgba(22,163,74,0.08); border-color: rgba(22,163,74,0.2); }

        .fp-success-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 42px;
          line-height: 1; letter-spacing: 0.04em; color: #fff; margin-bottom: 8px;
        }
        .fp-success-title.light { color: #0d120d; }

        .fp-success-body {
          font-size: 13px; font-weight: 300;
          color: rgba(230,239,230,0.45); line-height: 1.8; margin-bottom: 6px;
        }
        .fp-success-body.light { color: rgba(13,18,13,0.5); }

        .fp-success-email {
          font-size: 13px; font-weight: 600; color: #42FF4E;
          word-break: break-all; margin-bottom: 28px;
        }
        .fp-success-email.light { color: #16a34a; }

        .fp-success-note {
          font-size: 12px; color: rgba(230,239,230,0.25); line-height: 1.7; margin-bottom: 28px;
        }
        .fp-success-note.light { color: rgba(13,18,13,0.35); }

        .fp-back-login-btn {
          width: 100%; padding: 14px; border: none; border-radius: 10px;
          background: #42FF4E; color: #080c08;
          font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .fp-back-login-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(66,255,78,0.3); }
        .fp-back-login-btn:active { transform: translateY(0); }

        .fp-resend-row {
          text-align: center; margin-top: 16px;
          font-size: 13px; color: rgba(230,239,230,0.3);
        }
        .fp-resend-row.light { color: rgba(13,18,13,0.4); }
        .fp-resend-btn {
          color: #42FF4E; font-weight: 600; cursor: pointer;
          background: none; border: none;
          font-family: 'Barlow', sans-serif; font-size: 13px;
          padding: 0; margin-left: 4px; transition: opacity 0.2s;
          text-decoration: underline;
        }
        .fp-resend-btn:hover { opacity: 0.75; }
      `}</style>

      <div className={`fp-root${!isDarkMode ? " light" : ""}`}>
        <div className="fp-blob-1" />
        <div className="fp-blob-2" />

        <div className="fp-card">

          {/* ── LEFT PANEL ── */}
          <div className="fp-left">
            <div>
              <div className="fp-eyebrow">
                <span className="fp-eyebrow-line" />
                Cricket Analytics
              </div>
              <h1 className="fp-left-title">
                Secure
                <span>Your</span>
                Account.
              </h1>
              <p className="fp-left-desc">
                Reset your password quickly and get back to improving your
                batting technique with AI-powered insights.
              </p>
              <div className="fp-left-features">
                {["Secure reset link", "Expires in 30 minutes", "One-click return to training"].map((f, i) => (
                  <div className="fp-left-feature" key={i}>
                    <span className="fp-feat-dot" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <span className="fp-left-ghost" aria-hidden="true">RESET</span>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className={`fp-right${!isDarkMode ? " light" : ""}`}>

            {!sent ? (
              <>
                <button
                  type="button"
                  className="fp-back-btn"
                  onClick={() => navigate("/login")}
                  aria-label="Back to login"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Login
                </button>

                <div className={`fp-icon-wrap${!isDarkMode ? " light" : ""}`}>
                  <svg width="24" height="24" fill="none" stroke="#42FF4E" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 7l10 7 10-7" />
                  </svg>
                </div>

                <h2 className={`fp-heading${!isDarkMode ? " light" : ""}`}>Forgot Password</h2>
                <p className={`fp-sub${!isDarkMode ? " light" : ""}`}>
                  Enter your registered email and we'll send you a secure link to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="fp-field-wrap">
                    <label className={`fp-label${focused ? " active" : ""}${!isDarkMode ? " light" : ""}`}>
                      Email Address
                    </label>
                    <div className="fp-input-wrap">
                      <span className={`fp-input-icon${!isDarkMode ? " light" : ""}`}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 7l10 7 10-7" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`fp-input${!isDarkMode ? " light" : ""}`}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="fp-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Sending&hellip;</>
                    ) : (
                      <>
                        Send Reset Link
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="fp-divider">
                  <span className={`fp-divider-line${!isDarkMode ? " light" : ""}`} />
                  <span className={`fp-divider-text${!isDarkMode ? " light" : ""}`}>Remember it?</span>
                  <span className={`fp-divider-line${!isDarkMode ? " light" : ""}`} />
                </div>

                <p className={`fp-login-row${!isDarkMode ? " light" : ""}`}>
                  Know your password?
                  <button className="fp-login-link" type="button" onClick={() => navigate("/login")}>
                    Sign In
                  </button>
                </p>
              </>
            ) : (
              /* ── SUCCESS STATE ── */
              <div className="fp-success">
                <div className={`fp-success-icon${!isDarkMode ? " light" : ""}`}>
                  <svg width="28" height="28" fill="none" stroke="#42FF4E" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V22H4V12" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 7H2v5h20V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                  </svg>
                </div>

                <h2 className={`fp-success-title${!isDarkMode ? " light" : ""}`}>Check Your Email</h2>
                <p className={`fp-success-body${!isDarkMode ? " light" : ""}`}>
                  We've sent a password reset link to:
                </p>
                <p className={`fp-success-email${!isDarkMode ? " light" : ""}`}>{email}</p>
                <p className={`fp-success-note${!isDarkMode ? " light" : ""}`}>
                  The link will expire in <strong style={{ color: "inherit", fontWeight: 600 }}>30 minutes</strong>. 
                  Check your spam folder if you don't see it in your inbox.
                </p>

                <button
                  type="button"
                  className="fp-back-login-btn"
                  onClick={() => navigate("/login")}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Login
                </button>

                <p className={`fp-resend-row${!isDarkMode ? " light" : ""}`}>
                  Didn't receive it?
                  <button
                    type="button"
                    className="fp-resend-btn"
                    onClick={() => setSent(false)}
                  >
                    Resend email
                  </button>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}
