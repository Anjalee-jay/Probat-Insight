import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import adminLogo from "../images/Adminlogo.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollToAbout, setScrollToAbout] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "#about" },
    { name: "Contact Us", path: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (scrollToAbout && location.pathname === "/") {
      const section = document.getElementById("about");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setScrollToAbout(false);
      }
    }
  }, [location.pathname, scrollToAbout]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    setMenuOpen(false);
    if (path === "#about") {
      if (location.pathname !== "/") {
        setScrollToAbout(true);
        navigate("/");
      } else {
        const section = document.getElementById("about");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap');

        .navbar { position: sticky; top: 0; z-index: 100; font-family: 'Barlow', sans-serif; transition: background 0.3s, box-shadow 0.3s, border-color 0.3s; }
        .navbar.scrolled { background: rgba(5, 8, 5, 0.92) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(66,255,78,0.15); }
        .navbar.top { background: #000; border-bottom: 1px solid rgba(66,255,78,0.2); }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 76px; max-width: 1400px; margin: 0 auto; position: relative; }
        .nav-logo { height: 64px; width: auto; transition: filter 0.3s, transform 0.3s; flex-shrink: 0; cursor: pointer; margin-top: 6px; margin-left: -10px; }
        .nav-logo:hover { filter: drop-shadow(0 0 10px rgba(66,255,78,0.5)); transform: scale(1.03); }

        .nav-links { position: absolute; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 4px; }

        .nav-btn { position: relative; background: none; border: none; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55); padding: 8px 16px; border-radius: 8px; transition: color 0.2s, background 0.2s; }
        .nav-btn::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%) scaleX(0); width: calc(100% - 32px); height: 1.5px; background: #42FF4E; border-radius: 2px; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1); }
        .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-btn:hover::after { transform: translateX(-50%) scaleX(1); }
        .nav-btn.active { color: #42FF4E; }
        .nav-btn.active::after { transform: translateX(-50%) scaleX(1); }

        .nav-right { display: flex; align-items: center; gap: 10px; }

        .nav-login, .nav-signup {
          font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none; padding: 8px 20px; border-radius: 8px;
          border: 1px solid transparent; color: #ffffff; background: none; transition: color 0.2s;
        }
        .nav-login:hover, .nav-signup:hover { color: #ffffff; }
        .nav-login.active-link, .nav-signup.active-link {
          background: #42FF4E; color: #080c08; font-weight: 700; border-color: transparent;
          box-shadow: 0 4px 16px rgba(66,255,78,0.3);
        }

        /* ── Notification Bell ── */
        .notif-wrap { position: relative; }
        .notif-btn {
          position: relative; width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .notif-btn:hover { background: rgba(66,255,78,0.08); border-color: rgba(66,255,78,0.35); box-shadow: 0 0 12px rgba(66,255,78,0.2); }
        .notif-btn svg { width: 18px; height: 18px; stroke: rgba(255,255,255,0.6); transition: stroke 0.2s; }
        .notif-btn:hover svg { stroke: #42FF4E; }
        .notif-badge {
          position: absolute; top: -3px; right: -3px;
          min-width: 17px; height: 17px; padding: 0 4px;
          background: #42FF4E; border-radius: 999px;
          font-family: 'Barlow', sans-serif; font-size: 10px; font-weight: 700;
          color: #080c08; display: flex; align-items: center; justify-content: center;
          border: 2px solid #000; line-height: 1;
          animation: badgePop 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes badgePop { from { transform: scale(0); } to { transform: scale(1); } }

        /* Bell ring animation when there are unread */
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-5deg); }
          75% { transform: rotate(3deg); }
        }
        .notif-btn.has-unread svg { animation: bellRing 2.5s ease 0.5s; stroke: #42FF4E; }

        /* Notification dropdown */
        .notif-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0; width: 320px;
          background: #0d150d; border: 1px solid rgba(66,255,78,0.15); border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7); overflow: hidden;
          animation: dropIn 0.2s cubic-bezier(0.22,1,0.36,1); z-index: 200;
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: none; } }

        .notif-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px 12px; border-bottom: 1px solid rgba(66,255,78,0.08);
        }
        .notif-header-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.05em; text-transform: uppercase; }
        .notif-mark-all {
          background: none; border: none; cursor: pointer;
          font-family: 'Barlow', sans-serif; font-size: 11px; font-weight: 600;
          color: #42FF4E; letter-spacing: 0.04em; opacity: 0.8; transition: opacity 0.2s;
        }
        .notif-mark-all:hover { opacity: 1; }

        .notif-list { max-height: 300px; overflow-y: auto; }
        .notif-list::-webkit-scrollbar { width: 4px; }
        .notif-list::-webkit-scrollbar-track { background: transparent; }
        .notif-list::-webkit-scrollbar-thumb { background: rgba(66,255,78,0.2); border-radius: 4px; }

        .notif-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px; cursor: pointer; transition: background 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: rgba(66,255,78,0.05); }
        .notif-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #42FF4E;
          flex-shrink: 0; margin-top: 5px; box-shadow: 0 0 6px rgba(66,255,78,0.5);
        }
        .notif-dot.read { background: transparent; border: 1px solid rgba(255,255,255,0.15); box-shadow: none; }
        .notif-content { flex: 1; }
        .notif-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .notif-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.5; }
        .notif-time { font-size: 10px; color: rgba(66,255,78,0.5); margin-top: 4px; font-weight: 600; letter-spacing: 0.04em; }

        .notif-empty { padding: 32px 16px; text-align: center; }
        .notif-empty-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.4; }
        .notif-empty-text { font-size: 13px; color: rgba(255,255,255,0.3); }

        .notif-footer {
          padding: 10px 16px; border-top: 1px solid rgba(66,255,78,0.08);
          text-align: center;
        }
        .notif-view-all {
          background: none; border: none; cursor: pointer;
          font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 600;
          color: rgba(66,255,78,0.7); letter-spacing: 0.06em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .notif-view-all:hover { color: #42FF4E; }

        /* Profile avatar */
        .profile-wrap { position: relative; }
        .profile-icon-btn { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #42FF4E, #16a34a); border: 2px solid rgba(66,255,78,0.35); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 15px; color: #080c08; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; transition: all 0.2s; }
        .profile-icon-btn:hover { border-color: #42FF4E; box-shadow: 0 0 16px rgba(66,255,78,0.35); transform: scale(1.06); }

        .profile-dropdown { position: absolute; top: calc(100% + 12px); right: 0; min-width: 190px; background: #0d150d; border: 1px solid rgba(66,255,78,0.15); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); overflow: hidden; animation: dropIn 0.2s cubic-bezier(0.22,1,0.36,1); z-index: 200; }
        .dropdown-header { padding: 14px 16px 12px; border-bottom: 1px solid rgba(66,255,78,0.08); }
        .dropdown-user-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .dropdown-user-email { font-size: 11px; color: rgba(255,255,255,0.35); }
        .dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 16px; background: none; border: none; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.55); text-align: left; transition: background 0.15s, color 0.15s; }
        .dropdown-item:hover { background: rgba(66,255,78,0.07); color: #fff; }
        .dropdown-divider { height: 1px; background: rgba(66,255,78,0.08); margin: 4px 0; }
        .dropdown-logout { color: rgba(255,100,100,0.6) !important; }
        .dropdown-logout:hover { background: rgba(255,80,80,0.07) !important; color: #ff6b6b !important; }

        /* Hamburger */
        .hamburger { display: none; flex-direction: column; justify-content: center; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.2s; }
        .hamburger:hover { background: rgba(66,255,78,0.08); }
        .hamburger span { display: block; width: 22px; height: 1.5px; background: #42FF4E; border-radius: 2px; transition: transform 0.25s, opacity 0.25s; transform-origin: center; }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile menu */
        .mobile-menu { display: none; position: absolute; top: 76px; left: 0; right: 0; background: rgba(5,8,5,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(66,255,78,0.15); padding: 16px 24px 24px; flex-direction: column; gap: 4px; animation: slideDown 0.25s ease; }
        @keyframes slideDown { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: none; } }
        .mobile-menu.open { display: flex; }
        .mobile-nav-btn { background: none; border: none; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); padding: 12px 16px; border-radius: 8px; text-align: left; transition: color 0.2s, background 0.2s; }
        .mobile-nav-btn:hover, .mobile-nav-btn.active { color: #42FF4E; background: rgba(66,255,78,0.06); }
        .mobile-divider { height: 1px; background: rgba(66,255,78,0.08); margin: 8px 0; }
        .mobile-auth { display: flex; gap: 10px; padding: 4px 16px 0; }
        .mobile-auth a { flex: 1; text-align: center; font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; padding: 10px; border-radius: 8px; transition: all 0.2s; }
        .mob-login { color: #ffffff !important; border: 1px solid rgba(66,255,78,0.2); }
        .mob-login:hover { color: #42FF4E !important; border-color: rgba(66,255,78,0.5) !important; }
        .mob-signup { background: #42FF4E; color: #080c08 !important; }
        .mob-signup:hover { background: #5fff6a; }

        /* Mobile notifications row */
        .mobile-notif-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; border-radius: 8px; cursor: pointer;
          transition: background 0.15s;
        }
        .mobile-notif-row:hover { background: rgba(66,255,78,0.06); }
        .mobile-notif-label { font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .mobile-notif-badge { background: #42FF4E; color: #080c08; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; }

        @media(max-width: 768px) { .nav-links { display: none; } .nav-right { display: none; } .hamburger { display: flex; } .navbar-inner { padding: 0 24px; } }
      `}</style>

      <nav className={`navbar ${scrolled ? "scrolled" : "top"}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <img
            src={adminLogo}
            alt="ProBat Insight Logo"
            className="nav-logo"
            onClick={() => handleNavigation("/")}
          />

          {/* Center Nav */}
          <div className="nav-links">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`nav-btn ${isActive(item.path) ? "active" : ""}`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="nav-right">
            {isLoggedIn ? (
              <>
                {/* ── Notification Bell ── */}
                <div className="notif-wrap" ref={notifRef}>
                  <button
                    className={`notif-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                    onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
                    aria-label="Notifications"
                  >
                    {/* Bell SVG */}
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <span className="notif-header-title">Notifications</span>
                        {unreadCount > 0 && (
                          <button className="notif-mark-all" onClick={markAllRead}>
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="notif-list">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">
                            <div className="notif-empty-icon">🔔</div>
                            <div className="notif-empty-text">No notifications yet</div>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className="notif-item"
                              onClick={() => markRead(n.id)}
                            >
                              <div className={`notif-dot ${n.read ? "read" : ""}`} />
                              <div className="notif-content">
                                <div className="notif-title">{n.title}</div>
                                <div className="notif-desc">{n.desc}</div>
                                <div className="notif-time">{n.time}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="notif-footer">
                        <button
                          className="notif-view-all"
                          onClick={() => { setNotifOpen(false); navigate("/notifications"); }}
                        >
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar */}
                <div className="profile-wrap" ref={profileRef}>
                  <button
                    className="profile-icon-btn"
                    onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
                    aria-label="Open profile menu"
                  >
                    {getInitials(user?.name)}
                  </button>

                  {profileOpen && (
                    <div className="profile-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-user-name">{user?.name || "User"}</div>
                        <div className="dropdown-user-email">{user?.email || ""}</div>
                      </div>
                      <button
                        className="dropdown-item"
                        onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                      >
                        My Profile
                      </button>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-login ${isActive("/login") ? "active-link" : ""}`}>Login</Link>
                <Link to="/signup" className={`nav-signup ${isActive("/signup") ? "active-link" : ""}`}>Sign Up</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`mobile-nav-btn ${isActive(item.path) ? "active" : ""}`}
            >
              {item.name}
            </button>
          ))}

          <div className="mobile-divider" />

          {isLoggedIn ? (
            <>
              {/* Mobile Notifications Row */}
              <div
                className="mobile-notif-row"
                onClick={() => { setMenuOpen(false); navigate("/notifications"); }}
              >
                <span className="mobile-notif-label">🔔 Notifications</span>
                {unreadCount > 0 && (
                  <span className="mobile-notif-badge">{unreadCount}</span>
                )}
              </div>

              <button
                className="mobile-nav-btn"
                onClick={() => { setMenuOpen(false); navigate("/profile"); }}
              >
                My Profile
              </button>

              <button className="mob-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth">
              <Link to="/login" className="mob-login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="mob-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}