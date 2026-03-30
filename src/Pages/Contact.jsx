import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { submitContactMessage } from "../services/contactApi";

const faqs = [
  {
    q: "How does angle-based analysis work?",
    a: "Our AI system analyzes body joint angles from uploaded cricket videos to evaluate technique and provide improvement suggestions.",
  },
  {
    q: "What type of photos can I upload?",
    a: "You can upload batting photos from a side or front angle for best results.",
  },
  {
    q: "Is my photos data secure?",
    a: "Yes. All uploaded photos are securely stored and used only for performance analysis.",
  },
];

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [openFaq, setOpenFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await submitContactMessage(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      setSubmitError(error.message || "Failed to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .contact-root {
          min-height: 100vh;
          background-color: #0a0f0a;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(66,255,78,0.12) 0%, transparent 60%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(66,255,78,0.04) 39px,
              rgba(66,255,78,0.04) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(66,255,78,0.04) 39px,
              rgba(66,255,78,0.04) 40px
            );
          font-family: 'DM Sans', sans-serif;
          color: #e8f0e8;
          padding: 40px 20px 80px;
        }

        .contact-wrap {
          max-width: 780px;
          margin: 0 auto;
        }

        /* Back button */
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          color: #42FF4E;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0;
          margin-bottom: 48px;
          opacity: 0.8;
          transition: opacity 0.2s, gap 0.2s;
        }
        .back-btn:hover { opacity: 1; gap: 10px; }
        .back-btn svg { width: 18px; height: 18px; }

        /* Hero headline */
        .page-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #42FF4E;
          margin-bottom: 12px;
        }
        .page-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 10vw, 88px);
          line-height: 0.92;
          color: #fff;
          letter-spacing: 0.03em;
          margin-bottom: 16px;
        }
        .page-title span { color: #42FF4E; }
        .page-subtitle {
          font-size: 15px;
          color: rgba(232,240,232,0.5);
          max-width: 400px;
          line-height: 1.6;
          margin-bottom: 56px;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, #42FF4E33, transparent);
          margin: 48px 0;
        }

        /* Section label */
        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #42FF4E;
          margin-bottom: 24px;
        }

        /* Form */
        .form-grid { display: flex; flex-direction: column; gap: 16px; }

        .field-wrap { position: relative; }
        .field-wrap input,
        .field-wrap textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(66,255,78,0.15);
          border-radius: 10px;
          padding: 16px 20px;
          color: #e8f0e8;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          resize: none;
        }
        .field-wrap input::placeholder,
        .field-wrap textarea::placeholder { color: rgba(232,240,232,0.25); }
        .field-wrap input:focus,
        .field-wrap textarea:focus {
          border-color: rgba(66,255,78,0.6);
          background: rgba(66,255,78,0.05);
          box-shadow: 0 0 0 4px rgba(66,255,78,0.06);
        }

        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media(max-width: 520px) { .row-2 { grid-template-columns: 1fr; } }

        /* Submit button */
        .submit-btn {
          position: relative;
          overflow: hidden;
          background: #42FF4E;
          color: #0a0f0a;
          border: none;
          border-radius: 10px;
          padding: 17px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          width: 100%;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(66,255,78,0.3);
        }
        .submit-btn:active { transform: translateY(0); }

        /* Success toast */
        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(66,255,78,0.12);
          border: 1px solid rgba(66,255,78,0.4);
          border-radius: 10px;
          padding: 14px 20px;
          color: #42FF4E;
          font-size: 14px;
          font-weight: 500;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: none; } }

        /* Support card */
        .support-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(66,255,78,0.12);
          border-radius: 14px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .support-icon {
          flex-shrink: 0;
          width: 48px; height: 48px;
          background: rgba(66,255,78,0.1);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .support-icon svg { width: 22px; height: 22px; color: #42FF4E; }
        .support-card-text p { color: rgba(232,240,232,0.45); font-size: 13px; margin-bottom: 4px; }
        .support-email {
          color: #42FF4E;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.01em;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .support-email:hover { opacity: 0.75; }

        /* FAQ */
        .faq-list { display: flex; flex-direction: column; gap: 4px; }
        .faq-item {
          border: 1px solid rgba(66,255,78,0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-item.open { border-color: rgba(66,255,78,0.35); }

        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: rgba(255,255,255,0.03);
          border: none;
          padding: 20px 24px;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }
        .faq-trigger:hover { background: rgba(66,255,78,0.05); }
        .faq-trigger span {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #e8f0e8;
        }
        .faq-icon {
          flex-shrink: 0;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(66,255,78,0.12);
          color: #42FF4E;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.25s, background 0.2s;
        }
        .faq-item.open .faq-icon { transform: rotate(45deg); background: rgba(66,255,78,0.25); }

        .faq-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          padding: 0 24px;
        }
        .faq-item.open .faq-body {
          max-height: 200px;
          padding: 0 24px 20px;
        }
        .faq-body p {
          font-size: 14px;
          color: rgba(232,240,232,0.5);
          line-height: 1.7;
        }

        /* Number badge */
        .faq-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 0.06em;
          color: #42FF4E;
          opacity: 0.5;
          min-width: 24px;
        }
      `}</style>

      <div className="contact-root">
        <div className="contact-wrap">

          {/* Back */}
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Hero */}
          <p className="page-eyebrow">Cricket Angle System</p>
          <h1 className="page-title">Get in <span>Touch</span></h1>
          <p className="page-subtitle">
            Have questions about your technique or our platform? We're here to help you perform your best.
          </p>

          {/* Form Section */}
          <p className="section-label">Send a Message</p>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="row-2">
              <div className="field-wrap">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-wrap">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="field-wrap">
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            {submitError && (
              <div className="toast" style={{ color: "#ff6b6b", borderColor: "rgba(255,107,107,0.5)", background: "rgba(255,107,107,0.12)" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
                {submitError}
              </div>
            )}

            {submitted ? (
              <div className="toast">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Message sent! We'll get back to you shortly.
              </div>
            ) : (
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message →"}
              </button>
            )}
          </form>

          <div className="divider" />

          {/* Support */}
          <p className="section-label">Support</p>
          <div className="support-card">
            <div className="support-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="support-card-text">
              <p>For technical support or inquiries</p>
              <a className="support-email" href="mailto:support@cricketanglesystem.com">
                support@cricketanglesystem.com
              </a>
            </div>
          </div>

          <div className="divider" />

          {/* FAQ */}
          <p className="section-label">Frequently Asked Questions</p>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${openFaq === i ? "open" : ""}`}
              >
                <button
                  className="faq-trigger"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span className="faq-num">0{i + 1}</span>
                    <span>{faq.q}</span>
                  </div>
                  <div className="faq-icon">
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </button>
                <div className="faq-body">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default Contact;