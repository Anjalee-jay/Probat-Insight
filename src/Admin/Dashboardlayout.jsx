import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar, { NAV_ITEMS } from "../Components/Sidebar";
import AdminNavbar from "../Components/AdminNavbar";
import { useAuth } from "../context/AdminAuthContext";
import { fetchUsers } from "../services/usersApi";
import { getImages } from "../services/uploadsApi";
import { getAnalysisStats } from "../services/analysisApi";

const UPLOADS_STORAGE_KEY = "probat-admin-uploads";
const USERS_STORAGE_KEY = "probat-admin-users";
const DASHBOARD_REFRESH_EVENT = "probat-dashboard-refresh";
const AUTH_UPDATED_EVENT = "probat-auth-updated";

function getStoredUploads() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(UPLOADS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStoredUsers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getWeekStart(dateInput) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return date;
}

function buildWeeklyAnalysisRows(uploads) {
  const dayCounts = new Map();

  uploads.forEach((upload) => {
    let parsedDate;
    if (upload?.uploadedAt) {
      parsedDate = new Date(upload.uploadedAt);
    } else if (upload?.uploaded_at) {
      parsedDate = new Date(upload.uploaded_at);
    } else {
      return;
    }
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return;
    }

    const key = getWeekStart(parsedDate).toISOString().slice(0, 10);
    dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
  });

  const rows = [];
  const currentWeekStart = getWeekStart(new Date());

  for (let i = 7; i >= 0; i -= 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const key = weekStart.toISOString().slice(0, 10);

    rows.push({
      key,
      weekLabel: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rangeLabel: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      count: dayCounts.get(key) || 0,
    });
  }

  return rows;
}

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
    label: "Total Users",
    sub: "All registered",
    iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    iconBg:   "bg-blue-500",
    iconRing: "ring-blue-100",
    accent:   "text-blue-600",
    tag:      "bg-blue-50 text-blue-600 border-blue-100",
    bar:      "bg-blue-500",
  },
  {
    label: "Total Uploads",
    sub: "All time",
    iconPath: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    iconBg:   "bg-violet-500",
    iconRing: "ring-violet-100",
    accent:   "text-violet-600",
    tag:      "bg-violet-50 text-violet-600 border-violet-100",
    bar:      "bg-violet-500",
  },
];

const USER_TABLE_COLS  = ["User", "Role", "Analyses", "Status"];

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
  const navigate = useNavigate();
  const [dashboardUsers, setDashboardUsers] = useState([]);
  const [dashboardUploads, setDashboardUploads] = useState([]);

  const [statsData, setStatsData] = useState({
    totalUsers: null,
    totalAnalyses: null,
    totalUploads: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      const storedUsers = getStoredUsers();
      let totalUploads = 0;
      let dashboardUploadsData = [];
      let totalUsers = storedUsers.length;
      let totalAnalyses = 0; // Will be fetched from analysis collection

      // Fetch uploads from MongoDB probat_insight.images collection
      try {
        const imagesResponse = await getImages();
        const images = imagesResponse.images || [];
        totalUploads = images.length;
        dashboardUploadsData = images;
        setDashboardUploads(images);
      } catch (error) {
        console.error("Failed to fetch uploads from MongoDB:", error);
        // Fallback to stored uploads for display only
        const storedUploads = getStoredUploads();
        totalUploads = storedUploads.length;
        dashboardUploadsData = storedUploads;
        setDashboardUploads(storedUploads);
      }

      // Fetch real-time analysis stats from analysis collection
      try {
        const analysisStats = await getAnalysisStats();
        totalAnalyses = analysisStats.total || 0;
      } catch (error) {
        console.error("Failed to fetch analysis stats:", error);
        // Fallback to calculating from stored users (old behavior)
        totalAnalyses = storedUsers.reduce((sum, currentUser) => sum + Math.max(0, Number(currentUser.analyses) || 0), 0);
      }

      // Fetch users
      try {
        const users = await fetchUsers();
        totalUsers = users.length;
        setDashboardUsers(users.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch users:", error);
        // Keep stored users data
        setDashboardUsers(storedUsers.slice(0, 6));
      }

      if (!isMounted) {
        return;
      }

      setStatsData({
        totalUsers,
        totalAnalyses, // Now comes from analysis collection
        totalUploads, // This comes from MongoDB images collection
      });
    };

    loadStats();
    const refreshTimer = window.setInterval(loadStats, 10000); // Refresh every 10 seconds for real-time updates

    const onStorage = (event) => {
      if ([UPLOADS_STORAGE_KEY, USERS_STORAGE_KEY, "auth_user", "probat-admin-uploads-refresh"].includes(event.key)) {
        void loadStats();
      }
    };

    const onDashboardRefresh = () => {
      void loadStats();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(DASHBOARD_REFRESH_EVENT, onDashboardRefresh);
    window.addEventListener(AUTH_UPDATED_EVENT, onDashboardRefresh);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(DASHBOARD_REFRESH_EVENT, onDashboardRefresh);
      window.removeEventListener(AUTH_UPDATED_EVENT, onDashboardRefresh);
    };
  }, []);

  const displayUser = {
    initials: "AD",
    name: "Admin User",
    role: "Super Admin",
  };

  const welcomeName = displayUser.name.split(" ")[0] || "Admin";

  /* Replace with real API data */
  const stats = STAT_CARDS.map((s) => ({
    ...s,
    value:
      s.label === "Total Users"
        ? (statsData.totalUsers ?? "…")
        : s.label === "Total Analyses"
        ? (statsData.totalAnalyses ?? "…")
        : s.label === "Total Uploads"
        ? (statsData.totalUploads ?? "…")
        : "—",
  }));
  const users = dashboardUsers;
  const analysisRows = buildWeeklyAnalysisRows(dashboardUploads);
  const chartData = analysisRows.map((row) => row.count);
  const maxChart  = Math.max(...chartData, 1);

  const chartWidth = 100;
  const chartHeight = 100;
  const stepX = analysisRows.length > 1 ? chartWidth / (analysisRows.length - 1) : chartWidth;
  const linePoints = analysisRows
    .map((row, i) => {
      const x = i * stepX;
      const y = chartHeight - (row.count / maxChart) * chartHeight;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const areaPoints = `0,${chartHeight} ${linePoints} ${chartWidth},${chartHeight}`;

  const pageTitle = NAV_ITEMS.find(n => n.id === active)?.label || "Dashboard";
  const today     = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <Sidebar active={active} user={displayUser} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar
          title={pageTitle}
          user={displayUser}
          onProfileClick={() => navigate("/profile")}
        />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-8">

          {/* ── Page header ──────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">
                {today}
              </p>
              <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back, {welcomeName}
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">
                Here's what's happening with your cricket platform today.
              </p>
            </div>

            {/* Quick action */}
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600
              text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200
              hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Users
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

          {/* ── Users ─────────────────────────────────── */}
          <section>
            <SectionHead title="Details" sub="Users overview" />
            <div>

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
                    {users.length} shown
                  </span>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      {USER_TABLE_COLS.map(col => (
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
                        <td colSpan={USER_TABLE_COLS.length}>
                          <EmptyState
                            iconD="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            text="No users yet"
                            sub="Users will appear here once added"
                          />
                        </td>
                      </tr>
                    ) : users.map((u, i) => (
                      <tr key={u.id || i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-[11px] font-bold">
                              {(u.initials || u.name || "US").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-800 leading-tight">{u.name || "Unknown"}</p>
                              <p className="text-[11px] text-gray-400">{u.email || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-[12px] font-semibold text-gray-700">{u.role || "User"}</td>
                        <td className="px-6 py-3.5 text-[12px] font-semibold text-gray-700">{u.analyses ?? 0}</td>
                        <td className="px-6 py-3.5"><UserStatusBadge active={Boolean(u.active)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </section>

          {/* ── Bar chart ────────────────────────────────────────── */}
          <section>
            <SectionHead title="Analyses Per Week" sub="Weekly submission volume over the last 8 weeks" />
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
                  Last 8 weeks
                </div>
              </div>

              {/* Line chart */}
              <div className="px-6 py-6">
                <div className="h-40 w-full">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="analysisAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.7" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.7" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="#f3f4f6" strokeWidth="0.7" />

                    <polygon points={areaPoints} fill="url(#analysisAreaFill)" />
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {analysisRows.map((row, i) => {
                      const x = i * stepX;
                      const y = chartHeight - (row.count / maxChart) * chartHeight;

                      return (
                        <circle key={row.key} cx={x} cy={y} r="1.35" fill="#10b981">
                          <title>{`${row.rangeLabel}: ${row.count} analyses`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1 overflow-x-auto">
                  {analysisRows.map((row) => (
                    <span key={row.key} className="min-w-[56px] whitespace-nowrap text-center text-[9.5px] font-medium text-gray-300 tracking-wide">
                      {row.weekLabel}
                    </span>
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

function UserStatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${
        active
          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
          : "bg-gray-50 text-gray-400 border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}