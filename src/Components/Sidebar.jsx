import adminLogo from "../images/Adminlogo.png";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const NAV_ITEMS = [
  {
    id: "dashboard", label: "Dashboard", route: "/dashboard",
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    id: "analysis", label: "Analysis", route: "/analysis",
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    id: "users", label: "Users", route: "/users",
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    id: "uploads", label: "Uploads", route: "/uploads",
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  },
  {
    id: "reports", label: "Reports", route: "/reports",
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    id: "settings", label: "Settings", route: "/settings",
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>,
  },
];

/**
 * Props:
 *   user  {object}  { initials, name, role }
 *
 * Active state is derived automatically from the current URL.
 * Clicking any nav item navigates via React Router — no props needed.
 */
export default function Sidebar({
  user: userProp = { initials: "AD", name: "Admin User", role: "Super Admin" },
}) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user: authUser, logout } = useAuth();

  const isAdmin = location.pathname.startsWith("/admin");

  // Adjust nav items for admin context
  const adjustedNavItems = NAV_ITEMS.map(item => ({
    ...item,
    route: isAdmin ? `/admin${item.route}` : item.route
  }));

  // Prefer live auth data over prop defaults
  const displayUser = authUser
    ? {
        initials: authUser.initials || authUser.name?.slice(0, 2).toUpperCase() || "AD",
        name: authUser.name || "Admin User",
        role: authUser.role === "admin" ? "Super Admin" : authUser.role || "Admin",
      }
    : userProp;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Derive active item from current URL path
  const active = adjustedNavItems.find(n => location.pathname.startsWith(n.route))?.id || "dashboard";

  return (
    <aside
      className={`relative flex flex-col h-screen flex-shrink-0 transition-all duration-300 z-30
        bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.06)]
        ${collapsed ? "w-[72px] min-w-[72px]" : "w-[260px] min-w-[260px]"}`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-[13px] top-7 w-[26px] h-[26px] bg-white border border-gray-200
          rounded-full flex items-center justify-center text-gray-400 z-40 shadow-md
          hover:border-emerald-400 hover:text-emerald-500
          hover:shadow-[0_0_0_4px_rgba(52,211,153,0.12)] transition-all duration-200"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Logo */}
      <div
        className="flex items-center justify-center px-4 pt-2 pb-2 border-b border-gray-50 overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <img
          src={adminLogo}
          alt="Admin Logo"
          className={`object-contain transition-all duration-300 ${
            collapsed ? "w-11 h-11" : "h-16 w-auto max-w-[200px]"
          }`}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col px-3 py-4 gap-0.5 overflow-hidden">
        <p className={`text-[10px] font-['DM_Sans'] font-semibold tracking-[0.16em] uppercase
          text-gray-300 px-3 pb-2 pt-1 whitespace-nowrap transition-opacity duration-200
          ${collapsed ? "opacity-0" : "opacity-100"}`}>
          Main
        </p>

        {adjustedNavItems.slice(0, 4).map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={active === item.id}
            collapsed={collapsed}
            onClick={() => navigate(item.route)}
          />
        ))}

        <p className={`text-[10px] font-['DM_Sans'] font-semibold tracking-[0.16em] uppercase
          text-gray-300 px-3 pb-2 pt-4 whitespace-nowrap transition-opacity duration-200
          ${collapsed ? "opacity-0" : "opacity-100"}`}>
          System
        </p>

        {adjustedNavItems.slice(4).map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={active === item.id}
            collapsed={collapsed}
            onClick={() => navigate(item.route)}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl overflow-hidden">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600
            flex items-center justify-center font-['Syne'] font-bold text-sm text-white shadow-sm">
            {displayUser.initials}
          </div>
          <div className={`overflow-hidden transition-all duration-200 flex-1 ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
            <p className="font-['DM_Sans'] font-semibold text-[13px] text-gray-800 whitespace-nowrap leading-tight">{displayUser.name}</p>
            <p className="font-['DM_Sans'] text-[11px] text-gray-400 whitespace-nowrap leading-tight mt-0.5">{displayUser.role}</p>
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full flex items-center justify-center py-2 rounded-lg
              text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 mt-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}

/* ── Nav item ────────────────────────────────────────────────────────────── */
function NavItem({ item, active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left
        font-['DM_Sans'] font-medium text-[13.5px] whitespace-nowrap overflow-hidden
        transition-all duration-150 select-none group
        ${active
          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }`}
    >
      {active && (
        <span className="absolute left-0 top-[18%] bottom-[18%] w-[3px] bg-gradient-to-b from-emerald-400 to-green-500 rounded-r-full" />
      )}
      <span className={`flex-shrink-0 transition-colors ${active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`}>
        {item.icon}
      </span>
      <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
        {item.label}
      </span>
    </button>
  );
}