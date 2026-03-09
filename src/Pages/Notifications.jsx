import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FILTERS = ["All", "Unread", "Reports", "Updates", "Alerts"];

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // TODO: Replace with real API call
  useEffect(() => {
    // fetch("/api/notifications")
    //   .then((res) => res.json())
    //   .then((data) => { setNotifications(data); setLoading(false); });
    setLoading(false); // remove this line when using real API
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const dismissNotif = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => setNotifications([]);

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !n.read;
    if (activeFilter === "Reports") return n.type === "report";
    if (activeFilter === "Updates") return n.type === "update";
    if (activeFilter === "Alerts") return n.type === "alert";
    return true;
  });

  // Group notifications by date label (e.g. "Today", "Yesterday", "Mar 4")
  // Expected API shape per notification:
  // { id, type, title, desc, time, date, read, iconBg?, iconColor? }
  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .notifs-page {
          min-height: 100vh;
          background: #060a06;
          font-family: 'Barlow', sans-serif;
          color: #fff;
          padding: 48px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }
        .notifs-page::before {
          content: '';
          position: fixed;
          top: -200px; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 500px;
          background: radial-gradient(ellipse at center, rgba(66,255,78,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .notifs-container { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }

        /* Back */
        .notifs-back {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer;
          font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(66,255,78,0.6); padding: 6px 0; margin-bottom: 20px;
          transition: color 0.2s;
        }
        .notifs-back:hover { color: #42FF4E; }
        .notifs-back svg { width: 14px; height: 14px; stroke: currentColor; transition: transform 0.2s; }
        .notifs-back:hover svg { transform: translateX(-3px); }

        /* Header */
        .notifs-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 32px; gap: 16px; flex-wrap: wrap;
        }
        .notifs-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(66,255,78,0.5); margin-bottom: 6px;
        }
        .notifs-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 6vw, 52px);
          letter-spacing: 0.04em; color: #fff; line-height: 1;
        }
        .notifs-title span { color: #42FF4E; }
        .notifs-subtitle { margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.35); }

        .notifs-actions { display: flex; align-items: center; gap: 10px; padding-top: 28px; }
        .action-btn {
          background: none; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; cursor: pointer;
          font-family: 'Barlow', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 14px;
          transition: all 0.2s;
        }
        .action-btn-green { color: #42FF4E; border-color: rgba(66,255,78,0.2); }
        .action-btn-green:hover { background: rgba(66,255,78,0.08); border-color: rgba(66,255,78,0.4); }
        .action-btn-red { color: rgba(255,100,100,0.6); }
        .action-btn-red:hover { background: rgba(255,80,80,0.07); color: #ff6b6b; border-color: rgba(255,80,80,0.2); }

        /* Filters */
        .notifs-filters { display: flex; gap: 6px; margin-bottom: 28px; flex-wrap: wrap; }
        .filter-tab {
          background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 999px;
          padding: 6px 16px; font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s;
        }
        .filter-tab:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .filter-tab.active {
          background: #42FF4E; color: #060a06;
          border-color: transparent; box-shadow: 0 4px 16px rgba(66,255,78,0.25);
        }

        /* Date group */
        .date-group { margin-bottom: 32px; }
        .date-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
          margin-bottom: 10px; padding-left: 4px;
        }

        /* Notification card */
        .notif-card {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 16px 18px; margin-bottom: 8px;
          cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.2s;
          animation: cardIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .notif-card:hover {
          background: rgba(255,255,255,0.045);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }
        .notif-card.unread { border-left: 3px solid #42FF4E; background: rgba(66,255,78,0.03); }
        .notif-card.unread:hover { background: rgba(66,255,78,0.06); }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: none; }
        }

        .notif-card-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .notif-card-body { flex: 1; min-width: 0; }
        .notif-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 10px; margin-bottom: 4px;
        }
        .notif-card-title { font-size: 14px; font-weight: 700; color: #fff; line-height: 1.3; }
        .notif-card-time {
          font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
          color: rgba(255,255,255,0.3); flex-shrink: 0; padding-top: 2px;
        }
        .notif-card-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.55; }

        .notif-card-actions { display: flex; gap: 8px; margin-top: 10px; }
        .card-action-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Barlow', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 6px; transition: all 0.15s;
        }
        .card-read-btn { color: rgba(66,255,78,0.6); }
        .card-read-btn:hover { color: #42FF4E; background: rgba(66,255,78,0.08); }
        .card-dismiss-btn { color: rgba(255,255,255,0.2); }
        .card-dismiss-btn:hover { color: #ff6b6b; background: rgba(255,80,80,0.07); }

        .unread-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #42FF4E; box-shadow: 0 0 8px rgba(66,255,78,0.6);
          flex-shrink: 0; margin-top: 6px;
        }

        /* Empty / loading */
        .notifs-empty { text-align: center; padding: 80px 24px; }
        .empty-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(66,255,78,0.06); border: 1px solid rgba(66,255,78,0.12);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
        }
        .empty-icon svg { width: 30px; height: 30px; stroke: rgba(66,255,78,0.4); }
        .empty-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          letter-spacing: 0.06em; color: rgba(255,255,255,0.3); margin-bottom: 8px;
        }
        .empty-sub { font-size: 13px; color: rgba(255,255,255,0.2); }

        @media (max-width: 600px) {
          .notifs-page { padding: 32px 16px 60px; }
          .notif-card { padding: 14px; }
        }
      `}</style>

      <div className="notifs-page">
        <div className="notifs-container">

          {/* Back */}
          <button className="notifs-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          {/* Header */}
          <div className="notifs-header">
            <div>
              <div className="notifs-eyebrow">ProBat Insight</div>
              <h1 className="notifs-title">NOTIFI<span>CATIONS</span></h1>
              <p className="notifs-subtitle">
                {loading
                  ? "Loading…"
                  : unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>
            <div className="notifs-actions">
              {unreadCount > 0 && (
                <button className="action-btn action-btn-green" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button className="action-btn action-btn-red" onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="notifs-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-tab ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notification list */}
          {loading ? (
            <div className="notifs-empty">
              <div className="empty-sub">Loading notifications…</div>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="notifs-empty">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="empty-title">Nothing here</div>
              <div className="empty-sub">No notifications match this filter.</div>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="date-group">
                <div className="date-label">{date}</div>

                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-card ${!n.read ? "unread" : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    {/* Icon: provide iconBg + iconColor from your API */}
                    <div
                      className="notif-card-icon"
                      style={{ background: n.iconBg || "rgba(66,255,78,0.1)" }}
                    >
                      <svg
                        viewBox="0 0 24 24" fill="none"
                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        style={{ stroke: n.iconColor || "#42FF4E", width: 18, height: 18 }}
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>

                    {/* Body */}
                    <div className="notif-card-body">
                      <div className="notif-card-top">
                        <div className="notif-card-title">{n.title}</div>
                        <div className="notif-card-time">{n.time}</div>
                      </div>
                      <div className="notif-card-desc">{n.desc}</div>
                      <div className="notif-card-actions">
                        {!n.read && (
                          <button
                            className="card-action-btn card-read-btn"
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          className="card-action-btn card-dismiss-btn"
                          onClick={(e) => dismissNotif(n.id, e)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {!n.read && <div className="unread-dot" />}
                  </div>
                ))}
              </div>
            ))
          )}

        </div>
      </div>
    </>
  );
}