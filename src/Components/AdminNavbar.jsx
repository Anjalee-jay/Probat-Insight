import React from "react";

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export default function AdminNavbar({
  title = "Dashboard",
  user = { initials: "AD", name: "Admin User" },
  onSearch,
  onProfileClick,
}) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="px-8 py-4 flex items-center justify-between gap-4 max-[900px]:px-5 max-[700px]:flex-col max-[700px]:items-stretch">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-400">
            Admin Panel
          </p>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-gray-900">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 max-[700px]:justify-between">
          {onSearch && (
            <label className="flex items-center gap-2 px-3 py-2.5 w-[260px] max-[700px]:flex-1 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 focus-within:border-emerald-300 focus-within:bg-white transition-colors">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search"
                onChange={(event) => onSearch(event.target.value)}
                className="w-full bg-transparent outline-none text-[13px] text-gray-700 placeholder:text-gray-400"
              />
            </label>
          )}

          <button className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors flex items-center justify-center">
            <BellIcon />
          </button>

          <button
            type="button"
            onClick={onProfileClick}
            aria-label={user?.name ? `${user.name} profile` : "Admin profile"}
            title={user?.name || "Admin Profile"}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white
              border border-emerald-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all
              flex items-center justify-center text-[13px] font-bold"
          >
            {user.initials}
          </button>
        </div>
      </div>
    </header>
  );
}