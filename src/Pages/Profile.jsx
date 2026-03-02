import React, { useState } from "react";
import { useAuth } from "../Components/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: user?.email || "",
    phone: "", dob: "", gender: "", country: "",
    username: "", memberSince: "",
  });

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: connect to backend
    setEditOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');

        .profile-root {
          min-height: 100vh;
          background: #080c08;
          background-image:
            repeating-linear-gradient(90deg, rgba(66,255,78,0.025) 0px, rgba(66,255,78,0.025) 1px, transparent 1px, transparent 72px),
            repeating-linear-gradient(0deg, rgba(66,255,78,0.025) 0px, rgba(66,255,78,0.025) 1px, transparent 1px, transparent 72px);
          font-family: 'Barlow', sans-serif;
          color: #e6efe6;
          padding: 48px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }
        .profile-glow-1 {
          position: fixed; top: -120px; right: -80px;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(66,255,78,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .profile-glow-2 {
          position: fixed; bottom: -100px; left: -60px;
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .profile-inner { max-width: 860px; margin: 0 auto; position: relative; z-index: 1; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }

        .profile-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em;
          text-transform: uppercase; color: #42FF4E;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 6px; animation: fadeUp 0.5s ease both;
        }
        .profile-eyebrow-line { display: block; width: 24px; height: 1px; background: #42FF4E; }
        .profile-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(38px, 5vw, 56px);
          letter-spacing: 0.03em; line-height: 1;
          color: #fff; margin-bottom: 32px;
          animation: fadeUp 0.5s 0.05s ease both;
        }
        .profile-title span { color: #42FF4E; }

        /* Hero */
        .profile-hero {
          background: #0d120d; border: 1px solid rgba(66,255,78,0.12);
          border-radius: 20px; padding: 32px 36px;
          display: flex; align-items: center; gap: 28px;
          margin-bottom: 28px; position: relative; overflow: hidden;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .profile-hero::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #42FF4E, transparent 60%);
        }
        .hero-avatar {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #42FF4E, #16a34a);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 30px; color: #080c08; flex-shrink: 0;
          box-shadow: 0 0 32px rgba(66,255,78,0.25); border: 3px solid rgba(66,255,78,0.3);
        }
        .hero-info { flex: 1; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 20px;
          background: rgba(66,255,78,0.08); border: 1px solid rgba(66,255,78,0.2);
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: #42FF4E;
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #42FF4E; box-shadow: 0 0 6px #42FF4E; }
        .hero-edit-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(66,255,78,0.07); border: 1px solid rgba(66,255,78,0.2);
          color: #42FF4E; font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
        }
        .hero-edit-btn:hover { background: rgba(66,255,78,0.13); border-color: rgba(66,255,78,0.4); box-shadow: 0 0 16px rgba(66,255,78,0.15); }
        .hero-edit-btn svg { width: 14px; height: 14px; }

        /* Tabs */
        .profile-tabs {
          display: flex; gap: 4px; background: #0d120d;
          border: 1px solid rgba(66,255,78,0.1); border-radius: 12px;
          padding: 5px; margin-bottom: 24px; width: fit-content;
          animation: fadeUp 0.5s 0.15s ease both;
        }
        .profile-tab {
          padding: 8px 20px; border-radius: 8px; font-size: 12px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          background: none; border: none; color: rgba(255,255,255,0.35);
          font-family: 'Barlow', sans-serif; transition: all 0.2s;
        }
        .profile-tab.active { background: #42FF4E; color: #080c08; }
        .profile-tab:not(.active):hover { color: #fff; background: rgba(255,255,255,0.05); }

        /* Section cards */
        .section-card {
          background: #0d120d; border: 1px solid rgba(66,255,78,0.1);
          border-radius: 16px; overflow: hidden;
          margin-bottom: 20px; animation: fadeUp 0.5s 0.2s ease both;
        }
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px; border-bottom: 1px solid rgba(66,255,78,0.07);
        }
        .section-title-wrap { display: flex; align-items: center; gap: 10px; }
        .section-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(66,255,78,0.08); border: 1px solid rgba(66,255,78,0.15);
          display: flex; align-items: center; justify-content: center; color: #42FF4E;
        }
        .section-icon svg { width: 15px; height: 15px; }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.06em; color: #fff; }
        .section-subtitle { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }
        .section-edit {
          background: none; border: 1px solid rgba(66,255,78,0.15); cursor: pointer;
          font-family: 'Barlow', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(66,255,78,0.5); padding: 6px 12px; border-radius: 6px;
          transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .section-edit:hover { color: #42FF4E; border-color: rgba(66,255,78,0.35); background: rgba(66,255,78,0.05); }
        .section-edit svg { width: 12px; height: 12px; }

        /* Fields */
        .fields-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .field-item {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(66,255,78,0.05);
          border-right: 1px solid rgba(66,255,78,0.05);
          transition: background 0.15s;
        }
        .field-item:hover { background: rgba(66,255,78,0.02); }
        .field-item:nth-child(even) { border-right: none; }
        .field-item.full-width { grid-column: 1 / -1; border-right: none; }
        .field-label { font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
        .field-value { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85); display: flex; align-items: center; gap: 8px; }
        .field-empty { font-size: 13px; color: rgba(255,255,255,0.2); font-style: italic; }
        .field-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
        .tag-green { background: rgba(66,255,78,0.1); color: #42FF4E; }

        /* Stats strip */
        .stats-strip {
          display: grid; grid-template-columns: repeat(2, 1fr);
          background: #0d120d; border: 1px solid rgba(66,255,78,0.1);
          border-radius: 16px; overflow: hidden;
          margin-bottom: 20px; animation: fadeUp 0.5s 0.18s ease both;
        }
        .stat-cell { padding: 20px 24px; border-right: 1px solid rgba(66,255,78,0.07); text-align: center; }
        .stat-cell:last-child { border-right: none; }
        .stat-cell-val { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 0.05em; color: #42FF4E; line-height: 1; margin-bottom: 4px; }
        .stat-cell-label { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); }

        /* ═══════════════════════════════════
           MODAL
        ═══════════════════════════════════ */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: overlayIn 0.25s ease both;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .modal-card {
          width: 100%; max-width: 620px;
          max-height: calc(100vh - 40px);
          background: #0d120d;
          border: 1px solid rgba(66,255,78,0.18);
          border-radius: 20px;
          overflow: hidden;
          display: flex; flex-direction: column;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(66,255,78,0.05);
          animation: modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }

        /* top accent line */
        .modal-card::before {
          content: ''; display: block; height: 3px; flex-shrink: 0;
          background: linear-gradient(90deg, #42FF4E 0%, rgba(66,255,78,0.2) 60%, transparent 100%);
        }

        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 28px 16px; flex-shrink: 0;
          border-bottom: 1px solid rgba(66,255,78,0.07);
        }
        .modal-title-wrap { display: flex; align-items: center; gap: 12px; }
        .modal-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(66,255,78,0.08); border: 1px solid rgba(66,255,78,0.18);
          display: flex; align-items: center; justify-content: center; color: #42FF4E;
          flex-shrink: 0;
        }
        .modal-icon svg { width: 17px; height: 17px; }
        .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.06em; color: #fff; }
        .modal-subtitle { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }

        .modal-close {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.4);
          transition: all 0.2s;
        }
        .modal-close:hover { background: rgba(255,80,80,0.08); border-color: rgba(255,80,80,0.2); color: #ff6b6b; }
        .modal-close svg { width: 15px; height: 15px; }

        /* scrollable form body */
        .modal-body {
          overflow-y: auto; padding: 24px 28px;
          display: flex; flex-direction: column; gap: 20px;
          flex: 1;
        }
        .modal-body::-webkit-scrollbar { width: 4px; }
        .modal-body::-webkit-scrollbar-track { background: transparent; }
        .modal-body::-webkit-scrollbar-thumb { background: rgba(66,255,78,0.2); border-radius: 2px; }

        .modal-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(66,255,78,0.6);
          margin-bottom: -8px; padding-bottom: 8px;
          border-bottom: 1px solid rgba(66,255,78,0.07);
        }

        .modal-fields-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .modal-fields-row.single { grid-template-columns: 1fr; }

        .modal-field { display: flex; flex-direction: column; gap: 7px; }
        .modal-field label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.16em;
          text-transform: uppercase; color: rgba(255,255,255,0.35);
          transition: color 0.2s;
        }
        .modal-field:focus-within label { color: #42FF4E; }

        .modal-input, .modal-select {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(66,255,78,0.12); border-radius: 10px;
          padding: 11px 14px; color: #e6efe6;
          font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 400;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .modal-input::placeholder { color: rgba(230,239,230,0.2); }
        .modal-input:focus, .modal-select:focus {
          border-color: rgba(66,255,78,0.45);
          background: rgba(66,255,78,0.04);
          box-shadow: 0 0 0 3px rgba(66,255,78,0.06);
        }
        .modal-select option { background: #0d120d; color: #e6efe6; }

        /* Modal footer */
        .modal-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding: 16px 28px 20px; flex-shrink: 0;
          border-top: 1px solid rgba(66,255,78,0.07);
        }
        .modal-cancel {
          padding: 10px 20px; border-radius: 9px; cursor: pointer;
          background: none; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.45); font-family: 'Barlow', sans-serif;
          font-size: 13px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; transition: all 0.2s;
        }
        .modal-cancel:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .modal-save {
          padding: 10px 24px; border-radius: 9px; cursor: pointer;
          background: #42FF4E; border: none;
          color: #080c08; font-family: 'Barlow', sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .modal-save:hover { background: #5fff6a; box-shadow: 0 8px 24px rgba(66,255,78,0.3); transform: translateY(-1px); }
        .modal-save:active { transform: none; }
        .modal-save svg { width: 14px; height: 14px; transition: transform 0.2s; }
        .modal-save:hover svg { transform: translateX(3px); }

        @media (max-width: 640px) {
          .profile-hero { flex-direction: column; align-items: flex-start; }
          .fields-grid { grid-template-columns: 1fr; }
          .field-item { border-right: none; }
          .stats-strip { grid-template-columns: 1fr; }
          .stat-cell { border-right: none; border-bottom: 1px solid rgba(66,255,78,0.07); }
          .stat-cell:last-child { border-bottom: none; }
          .profile-tabs { width: 100%; }
          .profile-tab { flex: 1; text-align: center; }
          .modal-fields-row { grid-template-columns: 1fr; }
          .modal-card { border-radius: 16px; }
          .modal-body { padding: 20px; }
          .modal-header { padding: 16px 20px 14px; }
          .modal-footer { padding: 14px 20px 18px; }
        }
      `}</style>

      <div className="profile-root">
        <div className="profile-glow-1" />
        <div className="profile-glow-2" />

        <div className="profile-inner">

          {/* Page Title */}
          <div className="profile-eyebrow">
            <span className="profile-eyebrow-line" /> Account
          </div>
          <div className="profile-title">My <span>Profile</span></div>

          {/* Hero card */}
          <div className="profile-hero">
            <div className="hero-avatar">{getInitials(user?.name)}</div>
            <div className="hero-info">
              <div className="hero-badge">
                <span className="hero-badge-dot" /> Active Player
              </div>
            </div>
            <button className="hero-edit-btn" onClick={() => setEditOpen(true)}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            {[{ key: "account", label: "Account Details" }].map((t) => (
              <button
                key={t.key}
                className={`profile-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Account Details */}
          {activeTab === "account" && (
            <>
              <div className="stats-strip">
                <div className="stat-cell">
                  <div className="stat-cell-val">—</div>
                  <div className="stat-cell-label">Sessions Uploaded</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-val">—</div>
                  <div className="stat-cell-label">Days Active</div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="section-card">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <div className="section-icon">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="section-title">Personal Information</div>
                      <div className="section-subtitle">Basic account details from signup</div>
                    </div>
                  </div>
                  <button className="section-edit" onClick={() => setEditOpen(true)}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="fields-grid">
                  <div className="field-item">
                    <div className="field-label">First Name</div>
                    <div className="field-value">{form.firstName || <span className="field-empty">—</span>}</div>
                  </div>
                  <div className="field-item">
                    <div className="field-label">Last Name</div>
                    <div className="field-value">{form.lastName || <span className="field-empty">—</span>}</div>
                  </div>
                  <div className="field-item">
                    <div className="field-label">Email Address</div>
                    <div className="field-value">
                      {form.email || user?.email || <span className="field-empty">—</span>}
                      <span className="field-tag tag-green">Verified</span>
                    </div>
                  </div>
                  <div className="field-item">
                    <div className="field-label">Phone Number</div>
                    <div className="field-value">{form.phone || <span className="field-empty">—</span>}</div>
                  </div>
                  <div className="field-item">
                    <div className="field-label">Date of Birth</div>
                    <div className="field-value">{form.dob || <span className="field-empty">—</span>}</div>
                  </div>
                  <div className="field-item">
                    <div className="field-label">Gender</div>
                    <div className="field-value">{form.gender || <span className="field-empty">—</span>}</div>
                  </div>
                
                </div>
              </div>

              {/* Account Settings */}
              <div className="section-card">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <div className="section-icon">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="section-title">Account Settings</div>
                      <div className="section-subtitle">Preferences and membership</div>
                    </div>
                  </div>
                </div>
                <div className="fields-grid">
                  <div className="field-item">
                    <div className="field-label">Username</div>
                    <div className="field-value">{form.username || <span className="field-empty">—</span>}</div>
                  </div>
                  <div className="field-item">
                    <div className="field-label">Member Since</div>
                    <div className="field-value">{form.memberSince || <span className="field-empty">—</span>}</div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ════════════════════════════════
          EDIT PROFILE MODAL
      ════════════════════════════════ */}
      {editOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}>
          <div className="modal-card">

            {/* Header */}
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <div className="modal-title">Edit Profile</div>
                  <div className="modal-subtitle">Update your personal information</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setEditOpen(false)} aria-label="Close">
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <form className="modal-body" onSubmit={handleSave}>

              <div className="modal-section-label">Personal Information</div>

              <div className="modal-fields-row">
                <div className="modal-field">
                  <label>First Name</label>
                  <input className="modal-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter first name" />
                </div>
                <div className="modal-field">
                  <label>Last Name</label>
                  <input className="modal-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name" />
                </div>
              </div>

              <div className="modal-fields-row">
                <div className="modal-field">
                  <label>Email Address</label>
                  <input className="modal-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                </div>
                <div className="modal-field">
                  <label>Phone Number</label>
                  <input className="modal-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 000 000 0000" />
                </div>
              </div>

              <div className="modal-fields-row">
                <div className="modal-field">
                  <label>Date of Birth</label>
                  <input className="modal-input" name="dob" type="date" value={form.dob} onChange={handleChange} />
                </div>
                <div className="modal-field">
                  <label>Gender</label>
                  <select className="modal-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="modal-fields-row single">
                <div className="modal-field">
                 
                  
                </div>
              </div>

              <div className="modal-section-label">Account Settings</div>

              <div className="modal-fields-row">
                <div className="modal-field">
                  <label>Username</label>
                  <input className="modal-input" name="username" value={form.username} onChange={handleChange} placeholder="@username" />
                </div>
                <div className="modal-field">
                  <label>Member Since</label>
                  <input className="modal-input" name="memberSince" value={form.memberSince} onChange={handleChange} placeholder="e.g. Jan 2025" />
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="modal-footer">
              <button className="modal-cancel" type="button" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="modal-save" type="button" onClick={handleSave}>
                Save Changes
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
