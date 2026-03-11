import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import AdminNavbar from "../Components/AdminNavbar";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700;800&display=swap');`;

function Ico({ d, cls = "w-5 h-5", sw = "1.7" }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/* ── Toggle switch ───────────────────────────────────────────────────────── */
function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0
        ${enabled ? "bg-emerald-500" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
        ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

/* ── Text input ──────────────────────────────────────────────────────────── */
function Field({ label, hint, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-gray-700">{label}</label>
      {hint && <p className="text-[12px] text-gray-400 -mt-0.5">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 font-medium
          outline-none focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(52,211,153,0.1)]
          transition-all duration-200 placeholder-gray-300"
        style={{ fontFamily: "'Plus Jakarta Sans'" }}
      />
    </div>
  );
}

/* ── Section card ────────────────────────────────────────────────────────── */
function SettingsCard({ icon, iconBg, title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-gray-800" style={{ fontFamily: "'Syne'" }}>{title}</h3>
          {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

/* ── Toggle row ──────────────────────────────────────────────────────────── */
function ToggleRow({ label, sub, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[13.5px] font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

/* ── Tab ─────────────────────────────────────────────────────────────────── */
function Tab({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold w-full text-left transition-all
        ${active
          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm border border-emerald-100"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
      <span className={active ? "text-emerald-600" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile
  const [name,     setName]     = useState("Admin User");
  const [email,    setEmail]    = useState("admin@batlytics.com");
  const [phone,    setPhone]    = useState("");
  const [org,      setOrg]      = useState("Batlytics");

  // Notifications
  const [emailNotif,   setEmailNotif]   = useState(true);
  const [uploadNotif,  setUploadNotif]  = useState(true);
  const [reportNotif,  setReportNotif]  = useState(false);
  const [systemNotif,  setSystemNotif]  = useState(true);

  // Security
  const [twoFA,        setTwoFA]        = useState(false);
  const [sessionAlert, setSessionAlert] = useState(true);


  const TABS = [
    { id: "profile",       label: "Profile",       icon: <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" cls="w-4 h-4" sw="1.8" /> },
    { id: "notifications", label: "Notifications", icon: <Ico d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" cls="w-4 h-4" sw="1.8" /> },
    { id: "security",      label: "Security",      icon: <Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" cls="w-4 h-4" sw="1.8" /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Sidebar user={{ initials: "AD", name: "Admin User", role: "Super Admin" }} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title="Settings" user={{ initials: "AD", name: "Admin User" }} />

        <main className="flex-1 overflow-y-auto px-8 py-7">

          {/* Page header */}
          <div className="mb-7">
            <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Settings
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">Manage your account, preferences and security.</p>
          </div>

          <div className="flex gap-6 max-[900px]:flex-col">

            {/* Sidebar tabs */}
            <div className="w-52 flex-shrink-0 max-[900px]:w-full">
              <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-col gap-0.5 max-[900px]:flex-row max-[900px]:flex-wrap">
                {TABS.map(t => (
                  <Tab key={t.id} label={t.label} icon={t.icon} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-5">

              {/* ── PROFILE ── */}
              {activeTab === "profile" && (
                <>
                  <SettingsCard
                    icon={<Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" cls="w-5 h-5 text-blue-600" sw="1.7" />}
                    iconBg="bg-blue-50"
                    title="Personal Information"
                    subtitle="Update your name, email and contact details"
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-4 pb-2">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-emerald-200"
                        style={{ fontFamily: "'Syne'" }}>AD</div>
                      <div>
                        <button className="text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-1.5 rounded-lg transition-all">
                          Change Photo
                        </button>
                        <p className="text-[11px] text-gray-400 mt-1.5">JPG, PNG up to 2MB</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                      <Field label="Full Name"     value={name}  onChange={setName}  placeholder="Your name" />
                      <Field label="Organisation"  value={org}   onChange={setOrg}   placeholder="Team or club name" />
                      <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="admin@example.com" />
                      <Field label="Phone Number"  value={phone} onChange={setPhone} type="tel"   placeholder="+1 000 000 0000" />
                    </div>
                  </SettingsCard>

                  <SettingsCard
                    icon={<Ico d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" cls="w-5 h-5 text-violet-600" sw="1.7" />}
                    iconBg="bg-violet-50"
                    title="Role & Access"
                    subtitle="Your current access level"
                  >
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-[13.5px] font-semibold text-gray-700">Super Admin</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">Full access to all features and settings</p>
                      </div>
                      <span className="text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100">Active</span>
                    </div>
                  </SettingsCard>

                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200">
                      <Ico d="M5 13l4 4L19 7" cls="w-4 h-4" sw="2.2" />
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "notifications" && (
                <SettingsCard
                  icon={<Ico d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" cls="w-5 h-5 text-amber-600" sw="1.7" />}
                  iconBg="bg-amber-50"
                  title="Notification Preferences"
                  subtitle="Choose what alerts you receive"
                >
                  <ToggleRow label="Email Notifications"   sub="Receive summaries and alerts by email"   enabled={emailNotif}  onChange={setEmailNotif}  />
                  <div className="border-t border-gray-50" />
                  <ToggleRow label="Upload Alerts"         sub="Notify when an image finishes processing" enabled={uploadNotif} onChange={setUploadNotif} />
                  <div className="border-t border-gray-50" />
                  <ToggleRow label="Report Ready"          sub="Alert when a new report is generated"     enabled={reportNotif} onChange={setReportNotif} />
                  <div className="border-t border-gray-50" />
                  <ToggleRow label="System Announcements"  sub="Platform updates and maintenance alerts"  enabled={systemNotif} onChange={setSystemNotif} />
                </SettingsCard>
              )}

              {/* ── SECURITY ── */}
              {activeTab === "security" && (
                <>
                  <SettingsCard
                    icon={<Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" cls="w-5 h-5 text-emerald-600" sw="1.7" />}
                    iconBg="bg-emerald-50"
                    title="Security Settings"
                    subtitle="Protect your account"
                  >
                    <ToggleRow label="Two-Factor Authentication" sub="Add an extra layer of security to your login" enabled={twoFA} onChange={setTwoFA} />
                    <div className="border-t border-gray-50" />
                    <ToggleRow label="Session Alerts" sub="Get notified of new sign-ins from other devices" enabled={sessionAlert} onChange={setSessionAlert} />
                  </SettingsCard>

                  <SettingsCard
                    icon={<Ico d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" cls="w-5 h-5 text-red-500" sw="1.7" />}
                    iconBg="bg-red-50"
                    title="Change Password"
                    subtitle="Update your login credentials"
                  >
                    <div className="space-y-4">
                      <Field label="Current Password"  value="" onChange={() => {}} type="password" placeholder="••••••••" />
                      <Field label="New Password"      value="" onChange={() => {}} type="password" placeholder="••••••••" />
                      <Field label="Confirm Password"  value="" onChange={() => {}} type="password" placeholder="••••••••" />
                    </div>
                    <button className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mt-2">
                      <Ico d="M5 13l4 4L19 7" cls="w-4 h-4" sw="2.2" />
                      Update Password
                    </button>
                  </SettingsCard>
                </>
              )}


            </div>
          </div>
        </main>
      </div>
    </div>
  );
}