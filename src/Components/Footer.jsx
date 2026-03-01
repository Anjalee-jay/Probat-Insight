import React, { useState } from "react";

export default function Footer() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');

        .footer-root {
          background: #050805;
          border-top: 1px solid rgba(66,255,78,0.1);
          font-family: 'Barlow', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* top glow line */
        .footer-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #42FF4E, transparent);
          opacity: 0.6;
        }

        /* background grid */
        .footer-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(90deg, rgba(66,255,78,0.025) 0px, rgba(66,255,78,0.025) 1px, transparent 1px, transparent 80px),
            repeating-linear-gradient(0deg,  rgba(66,255,78,0.025) 0px, rgba(66,255,78,0.025) 1px, transparent 1px, transparent 80px);
          pointer-events: none;
        }

        .footer-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 72px 40px 0;
        }

        /* ── top grid ── */
        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1.4fr;
          gap: 64px;
          padding-bottom: 60px;
          border-bottom: 1px solid rgba(66,255,78,0.08);
        }
        @media(max-width: 760px) {
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .footer-inner { padding: 52px 24px 0; }
        }

        /* ── BRAND column ── */
        .brand-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          letter-spacing: 0.1em;
          color: #42FF4E;
          margin-bottom: 6px;
          line-height: 1;
        }

        .brand-tagline {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(66,255,78,0.4);
          margin-bottom: 20px;
        }

        .brand-divider {
          width: 40px; height: 1px;
          background: rgba(66,255,78,0.3);
          margin-bottom: 20px;
        }

        .brand-desc {
          font-size: 14px;
          font-weight: 300;
          color: rgba(230,239,230,0.4);
          line-height: 1.8;
          max-width: 280px;
        }

        /* ── NAV column ── */
        .footer-col-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(230,239,230,0.25);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-col-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(66,255,78,0.1);
        }

        .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0;
          font-size: 15px;
          font-weight: 500;
          color: rgba(230,239,230,0.45);
          cursor: pointer;
          padding: 8px 0;
          border-bottom: 1px solid rgba(66,255,78,0.05);
          transition: color 0.2s, gap 0.2s;
          position: relative;
        }
        .nav-item:last-child { border-bottom: none; }
        .nav-item:hover { color: #42FF4E; gap: 8px; }
        .nav-item::before {
          content: '→';
          font-size: 13px;
          opacity: 0;
          transition: opacity 0.2s;
          color: #42FF4E;
          position: absolute;
          left: -20px;
        }
        .nav-item:hover::before { opacity: 1; }

        /* ── FEEDBACK column ── */
        .feedback-col { display: flex; flex-direction: column; gap: 12px; }

        .feedback-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(66,255,78,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: #e6efe6;
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          resize: none;
        }
        .feedback-input::placeholder { color: rgba(230,239,230,0.2); }
        .feedback-input:focus {
          border-color: rgba(66,255,78,0.45);
          background: rgba(66,255,78,0.03);
          box-shadow: 0 0 0 3px rgba(66,255,78,0.05);
        }

        /* star rating */
        .stars-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
        }
        .star-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(230,239,230,0.2);
          margin-right: 6px;
        }
        .star-svg {
          cursor: pointer;
          transition: transform 0.15s;
          width: 22px; height: 22px;
        }
        .star-svg:hover { transform: scale(1.25); }

        /* submit */
        .submit-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 10px;
          background: #42FF4E;
          color: #050805;
          font-family: 'Barlow', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(66,255,78,0.28);
        }
        .submit-btn:active { transform: none; }

        /* toast */
        .toast {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(66,255,78,0.1);
          border: 1px solid rgba(66,255,78,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          color: #42FF4E;
          font-size: 13px;
          font-weight: 500;
          animation: toastIn 0.3s ease;
        }
        @keyframes toastIn {
          from { opacity:0; transform: translateY(6px); }
          to   { opacity:1; transform: none; }
        }

        /* ── BOTTOM BAR ── */
        .footer-bottom {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        @media(max-width: 600px) {
          .footer-bottom { flex-direction: column; align-items: flex-start; padding: 24px; }
        }

        .footer-copy {
          font-size: 12px;
          color: rgba(230,239,230,0.2);
          letter-spacing: 0.04em;
        }
        .footer-copy span { color: #42FF4E; }

        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-link {
          font-size: 12px;
          color: rgba(230,239,230,0.2);
          cursor: pointer;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: color 0.2s;
          font-weight: 500;
        }
        .footer-link:hover { color: rgba(66,255,78,0.7); }
      `}</style>

      <footer className="footer-root">
        <div className="footer-inner">
          <div className="footer-grid">

            {/* ── BRAND ── */}
            <div>
              <div className="brand-name">PROBAT INSIGHT</div>
              <div className="brand-tagline">AI Cricket Analytics</div>
              <div className="brand-divider" />
              <p className="brand-desc">
                Empowering cricketers with AI-driven analytics to master every shot
                and refine their game with professional-grade feedback.
              </p>
            </div>

            {/* ── FEEDBACK ── */}
            <div>
              <div className="footer-col-label">Rate &amp; Feedback</div>
              <div className="feedback-col">

                <input
                  type="text"
                  placeholder="Your Name"
                  className="feedback-input"
                />

                <div className="stars-row">
                  <span className="star-label">Rate</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="star-svg"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      viewBox="0 0 24 24"
                      fill={star <= (hovered || rating) ? "#42FF4E" : "none"}
                      stroke="#42FF4E"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.01 6.18a1 1 0 00.95.69h6.49c.969 0 1.371 1.24.588 1.81l-5.253 3.82a1 1 0 00-.364 1.118l2.01 6.18c.3.921-.755 1.688-1.538 1.118l-5.253-3.82a1 1 0 00-1.176 0l-5.253 3.82c-.783.57-1.838-.197-1.538-1.118l2.01-6.18a1 1 0 00-.364-1.118L.98 11.607c-.783-.57-.38-1.81.588-1.81h6.49a1 1 0 00.95-.69l2.01-6.18z"
                      />
                    </svg>
                  ))}
                </div>

                <textarea
                  rows="3"
                  placeholder="Write your feedback..."
                  className="feedback-input"
                />

                {submitted ? (
                  <div className="toast">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Thank you for your feedback!
                  </div>
                ) : (
                  <button className="submit-btn" onClick={handleSubmit}>
                    Submit Feedback
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 <span>ProBat Insight</span>. All rights reserved.</p>
          <div className="footer-links">
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Terms of Service</span>
          </div>
        </div>
      </footer>
    </>
  );
}