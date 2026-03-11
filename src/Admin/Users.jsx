import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import AdminNavbar from "../Components/AdminNavbar";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700;800&display=swap');`;

/* ── Icon helper ─────────────────────────────────────────────────────────── */
function Ico({ d, cls = "w-5 h-5", sw = "1.7" }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/* ── Role badge ──────────────────────────────────────────────────────────── */
function RoleBadge({ role }) {
  const styles = {
    Player:  "bg-blue-50   text-blue-600   border-blue-100",
    Coach:   "bg-violet-50 text-violet-600 border-violet-100",
    Admin:   "bg-emerald-50 text-emerald-600 border-emerald-100",
    Analyst: "bg-amber-50  text-amber-600  border-amber-100",
  };
  return (
    <span className={`text-[11px] font-semibold tracking-wide uppercase
      px-2.5 py-1 rounded-full border ${styles[role] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
      {role}
    </span>
  );
}

/* ── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase
      px-2.5 py-1 rounded-full border
      ${active
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : "bg-gray-50 text-gray-400 border-gray-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────── */
const AV_COLORS = [
  "from-emerald-400 to-green-600",
  "from-blue-400 to-indigo-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
];
function Avatar({ name, index, size = "w-10 h-10" }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??";
  const grad     = AV_COLORS[index % AV_COLORS.length];
  return (
    <div className={`${size} flex-shrink-0 rounded-xl bg-gradient-to-br ${grad}
      flex items-center justify-center text-white font-bold text-[13px] shadow-sm`}>
      {initials}
    </div>
  );
}

/* ── Summary strip ───────────────────────────────────────────────────────── */
function SummaryStrip({ users }) {
  const total    = users.length;
  const active   = users.filter(u => u.active).length;
  const players  = users.filter(u => u.role === "Player").length;
  const coaches  = users.filter(u => u.role === "Coach").length;

  return (
    <div className="grid grid-cols-4 gap-4 max-[800px]:grid-cols-2">
      {[
        { label: "Total Users",    value: total,   bg: "bg-gray-50 border-gray-100",         text: "text-gray-800"    },
        { label: "Active",         value: active,  bg: "bg-emerald-50 border-emerald-100",   text: "text-emerald-700" },
        { label: "Players",        value: players, bg: "bg-blue-50 border-blue-100",         text: "text-blue-700"    },
        { label: "Coaches",        value: coaches, bg: "bg-violet-50 border-violet-100",     text: "text-violet-700"  },
      ].map(s => (
        <div key={s.label} className={`${s.bg} border rounded-xl px-5 py-4 flex items-center gap-4`}>
          <p className={`text-[28px] font-extrabold leading-none ${s.text}`}
            style={{ fontFamily: "'Syne'" }}>{s.value}</p>
          <p className="text-[12px] font-semibold text-gray-400 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Filter tab ──────────────────────────────────────────────────────────── */
function FilterTab({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
        transition-all duration-150 select-none
        ${active
          ? "bg-white text-gray-800 shadow-sm border border-gray-200"
          : "text-gray-400 hover:text-gray-600 hover:bg-white/60"}`}
    >
      {label}
      {count != null && (
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md
          ${active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ── User row (table) ────────────────────────────────────────────────────── */
function UserRow({ user, index, onEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
      {/* User info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} index={index} />
          <div>
            <p className="text-[13.5px] font-semibold text-gray-800 leading-tight">{user.name}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4"><RoleBadge role={user.role} /></td>

      {/* Analyses */}
      <td className="px-6 py-4">
        <span className="text-[13px] font-semibold text-gray-700">{user.analyses ?? 0}</span>
      </td>

      {/* Joined */}
      <td className="px-6 py-4">
        <span className="text-[12px] text-gray-400">{user.joined ?? "—"}</span>
      </td>

      {/* Status */}
      <td className="px-6 py-4"><StatusBadge active={user.active} /></td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit && onEdit(user)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600
              flex items-center justify-center text-gray-400 transition-colors"
            title="Edit user"
          >
            <Ico d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              cls="w-3.5 h-3.5" sw="2" />
          </button>
          <button
            onClick={() => onDelete && onDelete(user)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500
              flex items-center justify-center text-gray-400 transition-colors"
            title="Delete user"
          >
            <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              cls="w-3.5 h-3.5" sw="2" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
            <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              cls="w-7 h-7 text-gray-300" sw="1.4" />
          </div>
          <p className="text-[15px] font-bold text-gray-400" style={{ fontFamily: "'Syne'" }}>No users found</p>
          <p className="text-[13px] text-gray-300 text-center max-w-xs">
            No users match your current filters, or none have been added yet.
          </p>
        </div>
      </td>
    </tr>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Users() {
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("newest");

  /* ── Replace with real API data ── */
  const users = [];

  const FILTERS = [
    { id: "all",     label: "All",     count: users.length },
    { id: "active",  label: "Active",  count: users.filter(u => u.active).length  },
    { id: "player",  label: "Players", count: users.filter(u => u.role === "Player").length },
    { id: "coach",   label: "Coaches", count: users.filter(u => u.role === "Coach").length  },
  ];

  const filtered = users.filter(u => {
    const matchFilter =
      filter === "all"     ? true :
      filter === "active"  ? u.active :
      filter === "player"  ? u.role === "Player" :
      filter === "coach"   ? u.role === "Coach"  : true;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <Sidebar user={{ initials: "AD", name: "Admin User", role: "Super Admin" }} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title="Users" user={{ initials: "AD", name: "Admin User" }} onSearch={setSearch} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                Users
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">
                Manage players, coaches and administrators.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600
              text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl
              shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300
              hover:-translate-y-0.5 transition-all duration-200">
              <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
              Add User
            </button>
          </div>

          {/* ── Summary strip ── */}
          <SummaryStrip users={users} />

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
              {FILTERS.map(f => (
                <FilterTab key={f.id} label={f.label} count={f.count}
                  active={filter === f.id} onClick={() => setFilter(f.id)} />
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-[13px] font-medium text-gray-600 bg-white border border-gray-200
                rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans'" }}
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="name_az">Sort: Name A–Z</option>
              <option value="name_za">Sort: Name Z–A</option>
              <option value="analyses">Sort: Most Analyses</option>
            </select>
          </div>

          {/* Results count */}
          {users.length > 0 && (
            <p className="text-[12px] text-gray-400 font-medium -mt-2">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of {users.length} users
            </p>
          )}

          {/* ── Table ── */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {["User", "Role", "Analyses", "Joined", "Status", ""].map(col => (
                    <th key={col}
                      className="text-left px-6 py-3.5 text-[10.5px] font-bold tracking-[0.12em]
                        uppercase text-gray-400 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <EmptyState />
                  : filtered.map((u, i) => (
                    <UserRow key={u.id ?? i} user={u} index={i} />
                  ))
                }
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}