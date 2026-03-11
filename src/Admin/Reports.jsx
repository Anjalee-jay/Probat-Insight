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

function StatusBadge({ status }) {
  const styles = {
    published: "bg-emerald-50 text-emerald-600 border-emerald-100",
    draft:     "bg-amber-50   text-amber-600   border-amber-100",
    archived:  "bg-gray-50    text-gray-500    border-gray-200",
  };
  const dots = {
    published: "bg-emerald-500",
    draft:     "bg-amber-500",
    archived:  "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${styles[status] || styles.archived}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.archived}`} />
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  const styles = {
    Performance: "bg-blue-50   text-blue-600   border-blue-100",
    Technique:   "bg-violet-50 text-violet-600 border-violet-100",
    Progress:    "bg-teal-50   text-teal-600   border-teal-100",
    Summary:     "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <span className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${styles[type] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
      {type}
    </span>
  );
}

function SummaryStrip({ reports }) {
  const total     = reports.length;
  const published = reports.filter(r => r.status === "published").length;
  const drafts    = reports.filter(r => r.status === "draft").length;
  const archived  = reports.filter(r => r.status === "archived").length;
  return (
    <div className="grid grid-cols-4 gap-4 max-[800px]:grid-cols-2">
      {[
        { label: "Total Reports", value: total,     bg: "bg-gray-50 border-gray-100",       text: "text-gray-800"    },
        { label: "Published",     value: published, bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" },
        { label: "Drafts",        value: drafts,    bg: "bg-amber-50 border-amber-100",     text: "text-amber-700"   },
        { label: "Archived",      value: archived,  bg: "bg-gray-100 border-gray-200",      text: "text-gray-600"    },
      ].map(s => (
        <div key={s.label} className={`${s.bg} border rounded-xl px-5 py-4 flex items-center gap-4`}>
          <p className={`text-[28px] font-extrabold leading-none ${s.text}`} style={{ fontFamily: "'Syne'" }}>{s.value}</p>
          <p className="text-[12px] font-semibold text-gray-400 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function FilterTab({ label, active, count, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all select-none
        ${active ? "bg-white text-gray-800 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600 hover:bg-white/60"}`}>
      {label}
      {count != null && (
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{count}</span>
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
        <Ico d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          cls="w-7 h-7 text-gray-300" sw="1.4" />
      </div>
      <p className="text-[15px] font-bold text-gray-400" style={{ fontFamily: "'Syne'" }}>No reports yet</p>
      <p className="text-[13px] text-gray-300 text-center max-w-xs">Generate your first report from completed analyses.</p>
    </div>
  );
}

function ReportCard({ report, index }) {
  const icons = {
    Performance: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    Technique:   "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    Progress:    "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    Summary:     "M4 6h16M4 10h16M4 14h8",
  };
  const bgColors = ["from-blue-50 to-indigo-50", "from-violet-50 to-purple-50", "from-teal-50 to-emerald-50", "from-orange-50 to-amber-50"];
  const iconColors = ["text-blue-500", "text-violet-500", "text-teal-500", "text-orange-500"];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgColors[index % 4]} border border-gray-100 flex items-center justify-center flex-shrink-0`}>
          <Ico d={icons[report.type] || icons.Summary} cls={`w-5 h-5 ${iconColors[index % 4]}`} sw="1.6" />
        </div>
        <StatusBadge status={report.status} />
      </div>

      <p className="text-[14px] font-bold text-gray-800 leading-snug mb-1">{report.title}</p>
      <p className="text-[12px] text-gray-400 mb-4">{report.player ?? "—"} · {report.date ?? "—"}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <TypeBadge type={report.type} />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-400 transition-colors" title="View">
            <Ico d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" cls="w-3.5 h-3.5" sw="2" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center text-gray-400 transition-colors" title="Download">
            <Ico d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" cls="w-3.5 h-3.5" sw="2" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors" title="Delete">
            <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" cls="w-3.5 h-3.5" sw="2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  /* ── Replace with real API data ── */
  const reports = [];

  const FILTERS = [
    { id: "all",       label: "All",       count: reports.length },
    { id: "published", label: "Published", count: reports.filter(r => r.status === "published").length },
    { id: "draft",     label: "Drafts",    count: reports.filter(r => r.status === "draft").length     },
    { id: "archived",  label: "Archived",  count: reports.filter(r => r.status === "archived").length  },
  ];

  const filtered = reports.filter(r => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.player?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Sidebar user={{ initials: "AD", name: "Admin User", role: "Super Admin" }} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title="Reports" user={{ initials: "AD", name: "Admin User" }} onSearch={setSearch} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Reports</h1>
              <p className="text-[13px] text-gray-400 mt-1">View, generate and export batting analysis reports.</p>
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200">
              <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
              Generate Report
            </button>
          </div>

          {/* Summary */}
          <SummaryStrip reports={reports} />

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
              {FILTERS.map(f => <FilterTab key={f.id} label={f.label} count={f.count} active={filter === f.id} onClick={() => setFilter(f.id)} />)}
            </div>
            <div className="flex items-center gap-2">
              <select className="text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans'" }}>
                <option>Sort: Newest</option>
                <option>Sort: Oldest</option>
                <option>Sort: A–Z</option>
              </select>
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
                {[
                  { id: "grid", d: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                  { id: "list", d: "M4 6h16M4 10h16M4 14h16M4 18h16" },
                ].map(v => (
                  <button key={v.id} onClick={() => setViewMode(v.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === v.id ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}>
                    <Ico d={v.d} cls="w-4 h-4" sw="1.8" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards / empty */}
          {filtered.length === 0 ? <EmptyState /> : (
            <div className={viewMode === "grid" ? "grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1" : "flex flex-col gap-4"}>
              {filtered.map((r, i) => <ReportCard key={r.id ?? i} report={r} index={i} />)}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}