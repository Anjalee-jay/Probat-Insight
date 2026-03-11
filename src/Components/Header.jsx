import React from "react";
import adminLogo from "../images/Adminlogo.png";

/**
 * Props:
 *   title     {string}   page title
 *   user      {object}   { initials, name }
 *   onSearch  {fn}       called with search string on change
 */
export default function Navbar({
  title = "Dashboard",
  user = { initials: "AD", name: "Admin User" },
  onSearch = () => {},
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <header
        className="h-[64px] bg-white border-b border-gray-100 flex items-center px-8 gap-4 flex-shrink-0"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 1px 0 #f1f5f9, 0 4px 16px rgba(0,0,0,0.04)" }}
      >
        {/* Logo + Page title */}
        <div className="flex-1 flex items-center gap-3">
          <img
            src={adminLogo}
            alt="ProBat Admin"
            className="h-9 w-auto object-contain"
          />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <div className="w-[3px] h-5 rounded-full bg-gradient-to-b from-emerald-400 to-green-600" />
          <h1 className="text-[18px] font-bold tracking-[-0.02em] text-gray-900">
            {title}
          </h1>
        </div>

        {/* Search */}
        <label className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl
          px-4 py-[9px] text-gray-400 cursor-text w-56
          focus-within:border-emerald-400 focus-within:bg-white
          focus-within:shadow-[0_0_0_4px_rgba(52,211,153,0.1)]
          transition-all duration-200">
          <svg className="w-[15px] h-[15px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            placeholder="Search…"
            onChange={e => onSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-gray-700 text-[13px] font-medium w-full placeholder-gray-300"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </label>

        {/* Notification */}
        <button className="relative w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl
          flex items-center justify-center text-gray-400
          hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200
          hover:shadow-[0_0_0_4px_rgba(52,211,153,0.08)]
          transition-all duration-200">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-[9px] right-[9px] w-[7px] h-[7px] bg-emerald-500 rounded-full border-[1.5px] border-white animate-pulse" />
        </button>

        {/* Settings */}
        

        {/* Divider */}
        <div className="w-px h-6 bg-gray-100 mx-1" />

        {/* Avatar + user info */}
        <div className="flex items-center gap-2.5 cursor-pointer group select-none">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600
            flex items-center justify-center text-white text-[13px] font-bold shadow-md shadow-emerald-100
            group-hover:shadow-emerald-200 transition-shadow">
            {user.initials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-[13px] font-semibold text-gray-800">{user.name}</p>
            <p className="text-[11px] font-medium text-gray-400">Administrator</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </header>
    </>
  );
}