import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollToAbout, setScrollToAbout] = useState(false);

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

  // After navigating to home, scroll to about once the page has rendered
  useEffect(() => {
    if (scrollToAbout && location.pathname === "/") {
      const section = document.getElementById("about");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setScrollToAbout(false);
      }
    }
  }, [location.pathname, scrollToAbout]);

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

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap');

        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Barlow', sans-serif;
          transition: background 0.3s, box-shadow 0.3s, border-color 0.3s;
        }

        .navbar.scrolled {
          background: rgba(5, 8, 5, 0.92) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(66,255,78,0.15);
        }

        .navbar.top {
          background: #000;
          border-bottom: 1px solid rgba(66,255,78,0.2);
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 76px;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
        }

        /* ── logo ── */
        .nav-logo {
          height: 64px;
          width: auto;
          transition: filter 0.3s, transform 0.3s;
          flex-shrink: 0;
        }
        .nav-logo:hover {
          filter: drop-shadow(0 0 10px rgba(66,255,78,0.5));
          transform: scale(1.03);
        }

        /* ── center nav ── */
        .nav-links {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Barlow', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          padding: 8px 16px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-btn::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: calc(100% - 32px);
          height: 1.5px;
          background: #42FF4E;
          border-radius: 2px;
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-btn:hover::after { transform: translateX(-50%) scaleX(1); }
        .nav-btn.active { color: #42FF4E; }
        .nav-btn.active::after { transform: translateX(-50%) scaleX(1); }

        /* ── right buttons ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-login {
          font-family: 'Barlow', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 8px 20px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: none;
          color: rgba(255,255,255,0.5);
          transition: color 0.2s;
        }
        .nav-login:hover {
          color: #fff;
        }
        .nav-login.active-link {
          background: #42FF4E;
          color: #080c08;
          font-weight: 700;
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(66,255,78,0.3);
        }
        .nav-login.active-link:hover {
          background: #5fff6a;
          color: #080c08;
        }

        .nav-signup {
          font-family: 'Barlow', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 8px 22px;
          border-radius: 8px;
          background: none;
          color: rgba(255,255,255,0.5);
          border: 1px solid transparent;
          transition: color 0.2s;
        }
        .nav-signup:hover {
          color: #fff;
        }
        .nav-signup.active-link {
          background: #42FF4E;
          color: #080c08;
          font-weight: 700;
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(66,255,78,0.3);
          transform: none;
        }
        .nav-signup.active-link:hover {
          background: #5fff6a;
          color: #080c08;
        }

        /* ── mobile hamburger ── */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .hamburger:hover { background: rgba(66,255,78,0.08); }
        .hamburger span {
          display: block;
          width: 22px; height: 1.5px;
          background: #42FF4E;
          border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
          transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── mobile menu ── */
        .mobile-menu {
          display: none;
          position: absolute;
          top: 76px; left: 0; right: 0;
          background: rgba(5,8,5,0.97);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(66,255,78,0.15);
          padding: 16px 24px 24px;
          flex-direction: column;
          gap: 4px;
          animation: slideDown 0.25s ease;
        }
        @keyframes slideDown {
          from { opacity:0; transform: translateY(-8px); }
          to   { opacity:1; transform: none; }
        }
        .mobile-menu.open { display: flex; }

        .mobile-nav-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Barlow', sans-serif;
          font-size: 14px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          padding: 12px 16px;
          border-radius: 8px;
          text-align: left;
          transition: color 0.2s, background 0.2s;
        }
        .mobile-nav-btn:hover, .mobile-nav-btn.active { color: #42FF4E; background: rgba(66,255,78,0.06); }

        .mobile-divider {
          height: 1px;
          background: rgba(66,255,78,0.08);
          margin: 8px 0;
        }

        .mobile-auth {
          display: flex; gap: 10px; padding: 4px 16px 0;
        }
        .mobile-auth a {
          flex: 1; text-align: center;
          font-family: 'Barlow', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none;
          padding: 10px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .mob-login {
          color: rgba(255,255,255,0.6) !important;
          border: 1px solid rgba(66,255,78,0.2);
        }
        .mob-login:hover { color: #42FF4E !important; border-color: rgba(66,255,78,0.5) !important; }
        .mob-signup {
          background: #42FF4E;
          color: #080c08 !important;
        }
        .mob-signup:hover { background: #5fff6a; }

        @media(max-width: 768px) {
          .nav-links { display: none; }
          .nav-right  { display: none; }
          .hamburger  { display: flex; }
          .navbar-inner { padding: 0 24px; }
        }
      `}</style>

      <nav className={`navbar ${scrolled ? "scrolled" : "top"}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <img
            src={require("../images/logo.png")}
            alt="ProBat Insight Logo"
            className="nav-logo"
            onClick={() => handleNavigation("/")}
            style={{ cursor: "pointer" }}
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

          {/* Right Buttons */}
          <div className="nav-right">
            <Link
              to="/login"
              className={`nav-login ${isActive("/login") ? "active-link" : ""}`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={`nav-signup ${isActive("/signup") ? "active-link" : ""}`}
            >
              Sign Up
            </Link>
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
          <div className="mobile-auth">
            <Link to="/login" className="mob-login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="mob-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        </div>
      </nav>
    </>
  );
}
