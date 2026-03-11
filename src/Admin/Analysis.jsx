import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import AdminNavbar from "../Components/AdminNavbar";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700;800&display=swap');`;

/* ── Tiny icon helper ────────────────────────────────────────────────────── */
function Ico({ d, cls = "w-5 h-5", sw = "1.7", fill = "none" }) {
  return (
    <svg className={cls} fill={fill} stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/* ── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    processing: "bg-amber-50 text-amber-600 border-amber-100",
    failed: "bg-red-50 text-red-500 border-red-100",
    pending: "bg-gray-50 text-gray-500 border-gray-200",
  };
  const dot = {
    completed: "bg-emerald-500",
    processing: "bg-amber-500 animate-pulse",
    failed: "bg-red-500",
    pending: "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase
      px-2.5 py-1 rounded-full border ${map[status] || map.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || dot.pending}`} />
      {status}
    </span>
  );
}

/* ── Score ring ──────────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 72 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = score != null ? (score / 100) * circ : 0;
  const color = score == null ? "#e2e8f0"
    : score >= 75 ? "#10b981"
    : score >= 50 ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-[15px] font-extrabold text-gray-800" style={{ fontFamily: "'Syne'" }}>
        {score != null ? score : "—"}
      </span>
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
          : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
        }`}
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

/* ── Analysis card ───────────────────────────────────────────────────────── */
function AnalysisCard({ item, onView }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-gray-100
      hover:-translate-y-0.5 transition-all duration-200 cursor-default group">

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Thumbnail placeholder */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50
            border border-gray-100 flex items-center justify-center flex-shrink-0">
            <Ico d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              cls="w-5 h-5 text-gray-300" sw="1.5" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-gray-800 leading-tight">{item.player}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{item.date}</p>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Score + details */}
      <div className="flex items-center gap-5 mb-4">
        <ScoreRing score={item.score} size={68} />
        <div className="flex-1 space-y-2">
          {[
            { label: "Shot Type",  value: item.shotType  },
            { label: "Stance",     value: item.stance    },
            { label: "Bat Angle",  value: item.batAngle  },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11.5px] text-gray-400 font-medium">{label}</span>
              <span className="text-[12px] font-semibold text-gray-700">{value ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" cls="w-3.5 h-3.5" sw="2" />
          {item.coach ?? "Unassigned"}
        </div>
        <button
          onClick={() => onView && onView(item)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600
            hover:text-emerald-700 transition-colors group-hover:underline"
        >
          View report
          <Ico d="M9 5l7 7-7 7" cls="w-3.5 h-3.5" sw="2.2" />
        </button>
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
        <Ico d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          cls="w-7 h-7 text-gray-300" sw="1.4" />
      </div>
      <p className="text-[15px] font-bold text-gray-400" style={{ fontFamily: "'Syne'" }}>No analyses yet</p>
      <p className="text-[13px] text-gray-300 text-center max-w-xs">
        Upload a batting image to get started with your first technique analysis.
      </p>
      <button className="mt-2 flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600
        text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200
        hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200">
        <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
        New Analysis
      </button>
    </div>
  );
}

/* ── Summary stat strip ──────────────────────────────────────────────────── */
function SummaryStrip({ analyses }) {
  const total      = analyses.length;
  const completed  = analyses.filter(a => a.status === "completed").length;
  const processing = analyses.filter(a => a.status === "processing").length;
  const avgScore   = completed
    ? Math.round(analyses.filter(a => a.score != null).reduce((s, a) => s + a.score, 0) / completed)
    : null;

  return (
    <div className="grid grid-cols-4 gap-4 max-[800px]:grid-cols-2">
      {[
        { label: "Total",       value: total,      color: "text-gray-800",    bg: "bg-gray-50 border-gray-100"       },
        { label: "Completed",   value: completed,  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
        { label: "Processing",  value: processing, color: "text-amber-700",   bg: "bg-amber-50 border-amber-100"     },
        { label: "Avg Score",   value: avgScore ?? "—", color: "text-blue-700", bg: "bg-blue-50 border-blue-100"    },
      ].map(s => (
        <div key={s.label} className={`${s.bg} border rounded-xl px-5 py-4 flex items-center gap-4`}>
          <p className={`text-[28px] font-extrabold leading-none ${s.color}`} style={{ fontFamily: "'Syne'" }}>
            {s.value}
          </p>
          <p className="text-[12px] font-semibold text-gray-400 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Analysis() {
  const [navActive] = useState("analyses");
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [viewMode, setViewMode]     = useState("grid"); // "grid" | "list"

  /* ── Replace with real API data ── */
  const analyses = [];

  const FILTERS = [
    { id: "all",        label: "All",        count: analyses.length },
    { id: "completed",  label: "Completed",  count: analyses.filter(a => a.status === "completed").length  },
    { id: "processing", label: "Processing", count: analyses.filter(a => a.status === "processing").length },
    { id: "failed",     label: "Failed",     count: analyses.filter(a => a.status === "failed").length     },
  ];

  const filtered = analyses.filter(a => {
    const matchFilter = filter === "all" || a.status === filter;
    const matchSearch = !search || a.player?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <Sidebar active={navActive} 
        user={{ initials: "AD", name: "Admin User", role: "Super Admin" }} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title="Analyses" user={{ initials: "AD", name: "Admin User" }}
          onSearch={setSearch} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                Batting Analyses
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">
                Review, filter and manage all technique reports.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600
              text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl
              shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300
              hover:-translate-y-0.5 transition-all duration-200">
              <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
              New Analysis
            </button>
          </div>

          {/* ── Summary strip ── */}
          <SummaryStrip analyses={analyses} />

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
              {FILTERS.map(f => (
                <FilterTab key={f.id} label={f.label} count={f.count}
                  active={filter === f.id} onClick={() => setFilter(f.id)} />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                className="text-[13px] font-medium text-gray-600 bg-white border border-gray-200
                  rounded-xl px-3 py-2 outline-none cursor-pointer
                  hover:border-gray-300 transition-colors"
                style={{ fontFamily: "'Plus Jakarta Sans'" }}
              >
                <option>Sort: Newest</option>
                <option>Sort: Oldest</option>
                <option>Sort: Score ↑</option>
                <option>Sort: Score ↓</option>
              </select>

              {/* View toggle */}
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
                {[
                  { id: "grid", d: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                  { id: "list", d: "M4 6h16M4 10h16M4 14h16M4 18h16" },
                ].map(v => (
                  <button key={v.id} onClick={() => setViewMode(v.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                      ${viewMode === v.id ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}>
                    <Ico d={v.d} cls="w-4 h-4" sw="1.8" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Results count ── */}
          {analyses.length > 0 && (
            <p className="text-[12px] text-gray-400 font-medium -mt-2">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of {analyses.length} analyses
            </p>
          )}

          {/* ── Cards grid / list ── */}
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1"
              : "flex flex-col gap-4"
          }>
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((item, i) => (
                <AnalysisCard key={item.id ?? i} item={item} />
              ))
            )}
          </div>

        </main>
      </div>
    </div>
  );
}