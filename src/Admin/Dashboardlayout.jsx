import React, { useState } from "react";
import Sidebar, { NAV_ITEMS } from "../Components/Sidebar";
import AdminNavbar from "../Components/AdminNavbar";

/* ── Font import ─────────────────────────────────────────────────────────── */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700;800&display=swap');`;

/* ── Stat card config ────────────────────────────────────────────────────── */
const STAT_CARDS = [
  {
    label: "Total Analyses",
    sub: "All time",
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    iconBg:   "bg-emerald-500",
    iconRing: "ring-emerald-100",
    accent:   "text-emerald-600",
    tag:      "bg-emerald-50 text-emerald-600 border-emerald-100",
    bar:      "bg-emerald-500",
  },
  {
    label: "Active Users",
    sub: "Currently online",
    iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    iconBg:   "bg-blue-500",
    iconRing: "ring-blue-100",
    accent:   "text-blue-600",
    tag:      "bg-blue-50 text-blue-600 border-blue-100",
    bar:      "bg-blue-500",
  },
  {
    label: "Uploads Today",
    sub: "Images processed",
    iconPath: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    iconBg:   "bg-violet-500",
    iconRing: "ring-violet-100",
    accent:   "text-violet-600",
    tag:      "bg-violet-50 text-violet-600 border-violet-100",
    bar:      "bg-violet-500",
  },
];

const TABLE_COLS  = ["User", "Role", "Analyses", "Status"];
const CHART_DAYS  = ["M","T","W","T","F","S","S","M","T","W","T","F","S","T"];

/* ── Helper: SVG icon ────────────────────────────────────────────────────── */
function Ico({ d, cls = "w-5 h-5", sw = "1.7" }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ iconD, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
        <Ico d={iconD} cls="w-6 h-6 text-gray-300" sw="1.4" />
      </div>
      <p className="text-[14px] font-semibold text-gray-400">{text}</p>
      <p className="text-[12px] text-gray-300 text-center max-w-[200px]">{sub}</p>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
function SectionHead({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-gray-800" style={{ fontFamily: "'Syne', sans-serif" }}>
          {title}
        </h2>
        {sub && <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {action && (
        <button className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700
          bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3.5 py-1.5 rounded-lg transition-all">
          {action}
        </button>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function Dashboardlayout() {
  const [active] = useState("dashboard");

  /* Replace with real API data */
  const stats     = STAT_CARDS.map(s => ({ ...s, value: "—" }));
  const users     = [];
  const activity  = [];
  const chartData = new Array(14).fill(0);
  const maxChart  = Math.max(...chartData, 1);

  const pageTitle = NAV_ITEMS.find(n => n.id === active)?.label || "Dashboard";
  const today     = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <Sidebar active={active}  user={{ initials: "AD", name: "Admin User", role: "Super Admin" }} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title={pageTitle} user={{ initials: "AD", name: "Admin User" }} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-8">

          {/* ── Page header ──────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">
                {today}
              </p>
              <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back, Admin 
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">
                Here's what's happening with your cricket platform today.
              </p>
            </div>

            {/* Quick action */}
            <button className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600
              text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200
              hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Analysis
            </button>
          </div>

          {/* ── Stat cards ───────────────────────────────────────── */}
          <section>
            <SectionHead title="Overview" sub="Key performance metrics" action="View all →" />
            <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="bg-white border border-gray-100 rounded-2xl p-6 relative overflow-hidden
                    hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-250 cursor-default"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl ${s.iconBg} ring-4 ${s.iconRing}
                      flex items-center justify-center text-white shadow-sm`}>
                      <Ico d={s.iconPath} cls="w-5 h-5" />
                    </div>
                    <span className={`text-[10.5px] font-semibold tracking-wider uppercase
                      px-2.5 py-1 rounded-full border ${s.tag}`}>
                      {s.sub}
                    </span>
                  </div>

                  {/* Value */}
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">
                    {s.label}
                  </p>
                  <p className="text-[40px] font-extrabold tracking-[-0.03em] text-gray-900 leading-none"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {s.value}
                  </p>

                  {/* Bottom bar */}
                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.bar} rounded-full w-0 transition-all duration-700`} />
                    </div>
                    <span className="text-[11px] text-gray-300 font-medium">No data</span>
                  </div>

                  {/* Decorative */}
                  <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full ${s.iconBg} opacity-[0.05]`} />
                </div>
              ))}
            </div>
          </section>

          {/* ── Users + Activity ─────────────────────────────────── */}
          <section>
            <SectionHead title="Details" sub="Users and live activity feed" />
            <div className="grid grid-cols-[1fr_360px] gap-5 max-[1024px]:grid-cols-1">

              {/* Users table */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        cls="w-4 h-4 text-gray-400" sw="1.6" />
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Users
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase
                    px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    0 total
                  </span>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      {TABLE_COLS.map(col => (
                        <th key={col}
                          className="text-left px-6 py-3 text-[10.5px] font-bold tracking-[0.12em]
                            uppercase text-gray-400 border-b border-gray-100 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={TABLE_COLS.length}>
                          <EmptyState
                            iconD="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            text="No users yet"
                            sub="Users will appear here once added"
                          />
                        </td>
                      </tr>
                    ) : users.map((u, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                        {/* Map your user fields here */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Activity feed */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Ico d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" cls="w-4 h-4 text-gray-400" sw="1.6" />
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Activity
                    </h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase
                    px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                {activity.length === 0 ? (
                  <EmptyState
                    iconD="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    text="No activity yet"
                    sub="Events will stream here in real time"
                  />
                ) : activity.map((a, i) => (
                  <div key={i}>{/* Map activity items here */}</div>
                ))}
              </div>

            </div>
          </section>

          {/* ── Bar chart ────────────────────────────────────────── */}
          <section>
            <SectionHead title="Analyses Per Day" sub="Daily submission volume over the last 2 weeks" />
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

              {/* Chart header strip */}
              <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[12px] font-medium text-gray-400">Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <span className="text-[12px] font-medium text-gray-400">No data</span>
                </div>
                <div className="ml-auto text-[11px] font-semibold tracking-wider uppercase
                  px-3 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                  Last 14 days
                </div>
              </div>

              {/* Bars */}
              <div className="px-6 py-6">
                <div className="flex items-end gap-2.5 h-32">
                  {chartData.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        className="w-full rounded-t-lg bg-gray-100 min-h-[4px]
                          group-hover:bg-emerald-200 transition-colors duration-200 cursor-pointer relative"
                        style={{ height: v > 0 ? `${(v / maxChart) * 100}%` : "4px" }}
                        title={`${v} analyses`}
                      >
                        {/* Tooltip */}
                        {v > 0 && (
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold
                            bg-gray-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100
                            transition-opacity whitespace-nowrap">
                            {v}
                          </span>
                        )}
                      </div>
                      <span className="text-[9.5px] font-medium text-gray-300 tracking-wide">
                        {CHART_DAYS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom padding */}
          <div className="h-4" />

        </main>
      </div>
    </div>
  );
}