import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../Components/Sidebar";
import AdminNavbar from "../Components/AdminNavbar";
import { uploadAnalysisImage } from "../services/uploadsApi";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700;800&display=swap');`;
const UPLOADS_STORAGE_KEY = "probat-admin-uploads";
const DASHBOARD_REFRESH_EVENT = "probat-dashboard-refresh";

function loadStoredUploads() {
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

function formatFileSize(sizeInBytes) {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return "-";
  }
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadedAt(date = new Date()) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function derivePlayerFromFilename(filename = "") {
  const base = String(filename).replace(/\.[^/.]+$/, "");
  const cleaned = base.replace(/[._-]+/g, " ").trim();
  if (!cleaned) {
    return "-";
  }

  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function Ico({ d, cls = "w-5 h-5", sw = "1.7" }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed:  "bg-emerald-50 text-emerald-600 border-emerald-100",
    processing: "bg-amber-50   text-amber-600   border-amber-100",
    failed:     "bg-red-50     text-red-500     border-red-100",
    pending:    "bg-gray-50    text-gray-500    border-gray-200",
  };
  const dots = {
    completed:  "bg-emerald-500",
    processing: "bg-amber-500 animate-pulse",
    failed:     "bg-red-500",
    pending:    "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.pending}`} />
      {status}
    </span>
  );
}

function SummaryStrip({ uploads }) {
  const total      = uploads.length;
  const completed  = uploads.filter(u => u.status === "completed").length;
  const processing = uploads.filter(u => u.status === "processing").length;
  const failed     = uploads.filter(u => u.status === "failed").length;
  return (
    <div className="grid grid-cols-4 gap-4 max-[800px]:grid-cols-2">
      {[
        { label: "Total Uploads",  value: total,      bg: "bg-gray-50 border-gray-100",       text: "text-gray-800"    },
        { label: "Completed",      value: completed,  bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" },
        { label: "Processing",     value: processing, bg: "bg-amber-50 border-amber-100",     text: "text-amber-700"   },
        { label: "Failed",         value: failed,     bg: "bg-red-50 border-red-100",         text: "text-red-600"     },
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
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
            <Ico d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" cls="w-7 h-7 text-gray-300" sw="1.4" />
          </div>
          <p className="text-[15px] font-bold text-gray-400" style={{ fontFamily: "'Syne'" }}>No uploads yet</p>
          <p className="text-[13px] text-gray-300 text-center max-w-xs">Upload a batting image to begin analysis.</p>
        </div>
      </td>
    </tr>
  );
}

export default function Uploads() {
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState(() => loadStoredUploads());
  const inputRef = useRef();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(uploads));
    window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT, { detail: { source: "uploads" } }));
  }, [uploads]);

  const FILTERS = [
    { id: "all",        label: "All",        count: uploads.length },
    { id: "completed",  label: "Completed",  count: uploads.filter(u => u.status === "completed").length  },
    { id: "processing", label: "Processing", count: uploads.filter(u => u.status === "processing").length },
    { id: "failed",     label: "Failed",     count: uploads.filter(u => u.status === "failed").length     },
  ];

  const filtered = useMemo(() => uploads.filter(u => {
    const matchFilter = filter === "all" || u.status === filter;
    const matchSearch = !search || u.filename?.toLowerCase().includes(search.toLowerCase())
      || u.player?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [uploads, filter, search]);

  const addPendingUpload = (file) => {
    const now = new Date();
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      filename: file.name,
      player: derivePlayerFromFilename(file.name),
      size: formatFileSize(file.size),
      uploadedAt: formatUploadedAt(now),
      uploadedAtIso: now.toISOString(),
      status: "processing",
    };

    setUploads((prev) => [item, ...prev]);
    return item.id;
  };

  const updateUploadStatus = (id, status, extra = {}) => {
    setUploads((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status, ...extra }
          : item
      )
    );
  };

  const handleSingleUpload = async (file) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      const tooLargeId = addPendingUpload(file);
      updateUploadStatus(tooLargeId, "failed", {
        error: "File exceeds 10MB limit",
      });
      return;
    }

    const pendingId = addPendingUpload(file);

    try {
      const responseData = await uploadAnalysisImage({ file });
      updateUploadStatus(pendingId, "completed", {
        analysis: responseData,
        score: Number.isFinite(Number(responseData?.scores?.overall))
          ? Math.round(Number(responseData.scores.overall))
          : null,
        grade: responseData?.grade || null,
        modelUsed: responseData?.model_used || null,
      });
    } catch (err) {
      updateUploadStatus(pendingId, "failed", {
        error: err?.message || "Upload failed",
      });
    }
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    files.forEach((file) => {
      void handleSingleUpload(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Sidebar user={{ initials: "AD", name: "Admin User", role: "Super Admin" }} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title="Uploads" user={{ initials: "AD", name: "Admin User" }} onSearch={setSearch} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Uploads
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">Manage batting image uploads and track processing status.</p>
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200">
              <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
              Upload Image
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl px-8 py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
              ${dragging
                ? "border-emerald-400 bg-emerald-50 scale-[1.01]"
                : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
              <Ico d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" cls="w-7 h-7 text-emerald-400" sw="1.5" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-gray-700">
                {dragging ? "Drop to upload" : "Drag & drop images here"}
              </p>
              <p className="text-[12px] text-gray-400 mt-1">or <span className="text-emerald-600 font-semibold">click to browse</span> — PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>

          {/* Summary */}
          <SummaryStrip uploads={uploads} />

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
              {FILTERS.map(f => (
                <FilterTab key={f.id} label={f.label} count={f.count} active={filter === f.id} onClick={() => setFilter(f.id)} />
              ))}
            </div>
            <select className="text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans'" }}>
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
              <option>Sort: Largest</option>
              <option>Sort: Smallest</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {["File", "Player", "Size", "Uploaded", "Status", ""].map(col => (
                    <th key={col} className="text-left px-6 py-3.5 text-[10.5px] font-bold tracking-[0.12em] uppercase text-gray-400 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <EmptyState /> : filtered.map((u, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Ico d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" cls="w-5 h-5 text-gray-400" sw="1.5" />
                        </div>
                        <p className="text-[13px] font-semibold text-gray-800">{u.filename}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-600">{u.player ?? "—"}</td>
                    <td className="px-6 py-4 text-[12px] text-gray-400">{u.size ?? "—"}</td>
                    <td className="px-6 py-4 text-[12px] text-gray-400">{u.uploadedAt ?? "—"}</td>
                    <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors">
                          <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" cls="w-3.5 h-3.5" sw="2" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}