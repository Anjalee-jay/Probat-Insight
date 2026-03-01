import React from "react";
import { Link } from "react-router-dom";
import playerImg from "../images/P3.png";

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,800&display=swap');

        .hp-root {
          background: #080c08;
          color: #e6efe6;
          min-height: 100vh;
          font-family: 'Barlow', sans-serif;
          overflow-x: hidden;
          position: relative;
        }
        .hp-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            repeating-linear-gradient(90deg, rgba(66,255,78,0.03) 0px, rgba(66,255,78,0.03) 1px, transparent 1px, transparent 80px),
            repeating-linear-gradient(0deg,  rgba(66,255,78,0.03) 0px, rgba(66,255,78,0.03) 1px, transparent 1px, transparent 80px);
          pointer-events: none;
          z-index: 0;
        }

        /* ══════ HERO ══════ */
        .hero-section {
          padding: 24px 40px 0;
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .hero-card {
          position: relative;
          width: 100%; max-width: 1240px;
          border-radius: 36px; overflow: hidden;
          display: flex; flex-direction: row;
          align-items: stretch;
          height: calc(100vh - 100px);
          max-height: 620px;
          min-height: 460px;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 0 0 1px rgba(66,255,78,0.12), 0 50px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(118deg, #42FF4E 0%, #1fa828 38%, #0e5c16 70%, #083810 100%);
        }
        .hero-bg::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 65% 70% at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 55%);
        }
        .hero-bg::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(95deg, transparent 45%, rgba(5,15,5,0.55) 100%);
        }
        .hero-noise {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.05;
        }
        .hero-lines {
          position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
        }
        .hero-lines::before {
          content: ''; position: absolute;
          top: -40%; right: -5%; width: 1px; height: 200%;
          background: rgba(255,255,255,0.08); transform: rotate(-18deg);
          box-shadow: 60px 0 0 rgba(255,255,255,0.05), 120px 0 0 rgba(255,255,255,0.03);
        }
        .hero-strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 1; height: 3px;
          background: linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        .hero-left {
          position: relative; z-index: 10; flex: 0 0 58%;
          display: flex; flex-direction: column; justify-content: center;
          padding: 48px 52px;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; padding: 5px 14px 5px 10px;
          width: fit-content; margin-bottom: 24px; backdrop-filter: blur(8px);
          opacity: 0; animation: heroFadeUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-eyebrow-dot {
          width: 7px; height: 7px; background: #42FF4E; border-radius: 50%;
          box-shadow: 0 0 6px rgba(66,255,78,0.8); animation: dotPulse 2s infinite;
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform: scale(1); }
          50%      { opacity:0.6; transform: scale(0.85); }
        }
        .hero-eyebrow-text {
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.8);
        }
        .hero-h1 {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(30px, 3.8vw, 54px); font-weight: 800; font-style: italic;
          text-transform: uppercase; line-height: 1.0; color: #fff;
          letter-spacing: -0.01em; margin: 0;
          text-shadow: 0 2px 24px rgba(0,0,0,0.25);
          opacity: 0; animation: heroFadeUp 0.55s 0.18s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-h1-2 { animation-delay: 0.27s; }
        .hero-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 4.8vw, 66px); letter-spacing: 0.07em;
          color: rgba(5,15,5,0.85); margin: 10px 0 20px; line-height: 1;
          opacity: 0; animation: heroFadeUp 0.55s 0.36s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-desc {
          font-size: 15px; font-weight: 400; line-height: 1.75;
          color: rgba(255,255,255,0.82); max-width: 460px; margin-bottom: 30px;
          text-shadow: 0 1px 8px rgba(0,0,0,0.2);
          opacity: 0; animation: heroFadeUp 0.55s 0.44s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-cta-row {
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
          opacity: 0; animation: heroFadeUp 0.55s 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-cta-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 30px; background: #080c08; color: #42FF4E;
          font-family: 'Barlow', sans-serif; font-weight: 700; font-size: 13px;
          letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;
          border-radius: 10px; border: 1px solid rgba(66,255,78,0.35);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .hero-cta-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(66,255,78,0.5);
          background: #0d140d;
        }
        .hero-cta-primary svg { transition: transform 0.2s; }
        .hero-cta-primary:hover svg { transform: translateX(4px); }
        .hero-cta-secondary {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.55);
          letter-spacing: 0.06em; text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .hero-cta-secondary:hover { color: #fff; border-color: rgba(255,255,255,0.6); }
        .hero-right {
          position: relative; z-index: 10; flex: 1;
          display: flex; align-items: flex-end; justify-content: center;
          overflow: visible;
        }
        .hero-img {
          height: 128%; width: auto; object-fit: contain; object-position: bottom;
          filter: drop-shadow(-28px 8px 40px rgba(0,0,0,0.5));
          opacity: 0; animation: heroFadeIn 1s 0.55s forwards;
          margin-right: auto;
          margin-left: -20px;
        }
        .hero-stat-card {
          position: absolute; bottom: 40px; left: -24px;
          background: rgba(5,10,5,0.85); backdrop-filter: blur(16px);
          border: 1px solid rgba(66,255,78,0.2); border-radius: 14px;
          padding: 14px 20px; z-index: 20;
          opacity: 0; animation: heroFadeUp 0.6s 0.9s forwards;
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }
        .hero-stat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; color: #42FF4E; line-height: 1;
          display: flex; align-items: baseline; gap: 2px;
        }
        .hero-stat-suffix { font-size: 20px; }
        .hero-stat-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(230,239,230,0.35); margin-top: 2px;
        }
        @keyframes heroFadeUp {
          from { opacity:0; transform: translateY(22px); }
          to   { opacity:1; transform: none; }
        }
        @keyframes heroFadeIn { from { opacity:0; } to { opacity:1; } }
        @media(max-width: 960px) {
          .hero-section { padding: 20px 20px 0; }
          .hero-card { flex-direction: column; height: auto; max-height: none; min-height: auto; border-radius: 28px; }
          .hero-left { flex: none; padding: 40px 28px 24px; }
          .hero-right { min-height: 300px; justify-content: center; }
          .hero-img { height: 300px; }
          .hero-stat-card { bottom: 20px; left: 50%; transform: translateX(-50%); }
        }

        /* ══════ ABOUT ══════ */
        .about-section {
          position: relative; z-index: 1;
          padding: 120px 40px 80px;
          overflow: hidden;
        }
        .about-section::before {
          content: ''; position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 800px; height: 400px;
          background: radial-gradient(ellipse, rgba(66,255,78,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .about-inner { max-width: 1120px; margin: 0 auto; }

        .about-header { text-align: center; margin-bottom: 80px; }
        .about-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #42FF4E; margin-bottom: 20px;
        }
        .about-eyebrow-line { display: block; width: 28px; height: 1px; background: #42FF4E; }
        .about-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 7vw, 88px);
          line-height: 0.9; letter-spacing: 0.03em; color: #fff; margin-bottom: 24px;
        }
        .about-h1 span { color: #42FF4E; }
        .about-lead {
          max-width: 600px; margin: 0 auto;
          font-size: 16px; font-weight: 300;
          color: rgba(230,239,230,0.45); line-height: 1.8;
        }

        .mission-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: stretch;
        }
        @media(max-width: 800px) { .mission-grid { grid-template-columns: 1fr; } }
        @media(max-width: 600px) { .about-section { padding: 80px 24px 60px; } }

        .mission-left { display: flex; flex-direction: column; justify-content: center; padding: 8px 0; }
        .mission-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #42FF4E; margin-bottom: 18px;
        }
        .mission-eyebrow-line { display: block; width: 28px; height: 1px; background: #42FF4E; }
        .mission-h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4.5vw, 62px); letter-spacing: 0.04em;
          color: #fff; line-height: 0.95; margin-bottom: 28px;
        }
        .mission-h2 em { color: #42FF4E; font-style: normal; display: block; }
        .mission-p {
          font-size: 15px; font-weight: 300;
          color: rgba(230,239,230,0.5); line-height: 1.8; margin-bottom: 18px;
        }
        .mission-stats {
          display: flex; gap: 32px; margin-top: 36px; flex-wrap: wrap;
        }
        .mission-stat { display: flex; flex-direction: column; gap: 4px; }
        .mission-stat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 40px; color: #42FF4E; line-height: 1; letter-spacing: 0.04em;
        }
        .mission-stat-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(230,239,230,0.3);
        }
        .mission-stat-divider {
          width: 1px; background: rgba(66,255,78,0.12); align-self: stretch; margin: 4px 0;
        }

        .diff-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(66,255,78,0.14);
          border-radius: 24px; padding: 48px 44px;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .diff-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #42FF4E 0%, #2563EB 60%, transparent 100%);
        }
        .diff-card::after {
          content: ''; position: absolute; bottom: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(66,255,78,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .diff-ghost {
          position: absolute; bottom: -10px; right: 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 110px; line-height: 1;
          color: rgba(66,255,78,0.03); pointer-events: none;
          letter-spacing: 0.06em; white-space: nowrap;
        }
        .diff-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(230,239,230,0.25); margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .diff-label::after { content: ''; flex: 1; height: 1px; background: rgba(66,255,78,0.08); }
        .diff-h3 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; letter-spacing: 0.05em;
          color: #fff; margin-bottom: 32px; line-height: 1;
        }
        .diff-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; flex: 1; }
        .diff-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(66,255,78,0.07);
          font-size: 15px; font-weight: 500;
          color: rgba(230,239,230,0.7);
          transition: color 0.2s; cursor: default;
        }
        .diff-item:last-child { border-bottom: none; }
        .diff-item:hover { color: #e6efe6; }
        .diff-item-left { display: flex; align-items: center; gap: 14px; flex: 1; }
        .diff-check {
          width: 28px; height: 28px; flex-shrink: 0;
          background: rgba(66,255,78,0.1); border: 1px solid rgba(66,255,78,0.2);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .diff-item:hover .diff-check { background: rgba(66,255,78,0.18); }
        .diff-check svg { width: 13px; height: 13px; stroke: #42FF4E; stroke-width: 2.5; fill: none; }
        .diff-arrow {
          font-size: 12px; color: rgba(66,255,78,0.25);
          transition: color 0.2s, transform 0.2s;
        }
        .diff-item:hover .diff-arrow { color: #42FF4E; transform: translateX(3px); }

        /* ══════ HOW IT WORKS ══════ */
        .how-section { position: relative; z-index: 1; padding: 0 40px 100px; }
        .how-inner { max-width: 1120px; margin: 0 auto; text-align: center; }
        .section-sep {
          max-width: 1120px; margin: 0 auto 80px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(66,255,78,0.2), transparent);
        }
        .how-h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 6vw, 76px); letter-spacing: 0.04em;
          color: #fff; line-height: 1; margin-bottom: 56px;
        }
        .how-h2 span { color: #42FF4E; }
        .steps-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; border: 1px solid rgba(66,255,78,0.12);
          border-radius: 24px; overflow: hidden;
        }
        @media(max-width: 700px) { .steps-grid { grid-template-columns: 1fr; } }
        .step-card {
          background: rgba(10,14,10,0.95); padding: 48px 36px;
          position: relative; border-right: 1px solid rgba(66,255,78,0.1);
          transition: background 0.3s; cursor: default; text-align: left; overflow: hidden;
        }
        .step-card:last-child { border-right: none; }
        .step-card:hover { background: rgba(66,255,78,0.04); }
        .step-ghost-num {
          position: absolute; top: 16px; right: 20px;
          font-family: 'Bebas Neue', sans-serif; font-size: 90px; line-height: 1;
          color: rgba(66,255,78,0.055); pointer-events: none; transition: color 0.3s;
        }
        .step-card:hover .step-ghost-num { color: rgba(66,255,78,0.1); }
        .step-top-line {
          display: block; width: 36px; height: 3px; background: #42FF4E;
          border-radius: 2px; margin-bottom: 24px; transition: width 0.3s;
        }
        .step-card:hover .step-top-line { width: 56px; }
        .step-h3 {
          font-family: 'Bebas Neue', sans-serif; font-size: 34px;
          letter-spacing: 0.05em; color: #42FF4E; margin-bottom: 12px;
        }
        .step-p { font-size: 14px; font-weight: 300; color: rgba(230,239,230,0.45); line-height: 1.75; }
      `}</style>

      <div className="hp-root">

        {/* ══════ HERO ══════ */}
        <section className="hero-section">
          <div className="hero-card">
            <div className="hero-bg" />
            <div className="hero-noise" />
            <div className="hero-lines" />
            <div className="hero-strip" />

            <div className="hero-left">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                <span className="hero-eyebrow-text">AI-Powered Cricket Analytics</span>
              </div>
              <h1 className="hero-h1">Sharpen Your Technique</h1>
              <h1 className="hero-h1 hero-h1-2">Elevate Your Game</h1>
              <h2 className="hero-brand">PROBAT INSIGHT</h2>
              <p className="hero-desc">
                ProBat Insight leverages advanced computer vision and angle-based analysis
                to evaluate cricket batting techniques with precision. Players and coaches
                receive instant technical feedback and personalized practice drills.
              </p>
              <div className="hero-cta-row">
                <Link to="/picupload" className="hero-cta-primary">
                  Get Start
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <a href="#about" className="hero-cta-secondary">See how it works ↓</a>
              </div>
            </div>

            <div className="hero-right">
              <img src={playerImg} alt="Cricket player" className="hero-img" />
              
            </div>
          </div>
        </section>

        {/* ══════ ABOUT ══════ */}
        <section id="about" className="about-section">
          <div className="about-inner">

            <div className="about-header">
              <div className="about-eyebrow">
                <span className="about-eyebrow-line" />
                The Platform
                <span className="about-eyebrow-line" />
              </div>
              <h1 className="about-h1">
                About <span>ProBat</span><br />Insight
              </h1>
              <p className="about-lead">
                ProBat Insight is an AI-powered cricket analytics platform designed
                to help players refine their batting technique using advanced pose
                detection and angle-based analysis.
              </p>
            </div>

            <div className="mission-grid">
              {/* Left */}
              <div className="mission-left">
                <div className="mission-eyebrow">
                  <span className="mission-eyebrow-line" />
                  What Drives Us
                </div>
                <h2 className="mission-h2">
                  Our
                  <em>Mission</em>
                </h2>
                <p className="mission-p">
                  Our mission is to bridge the gap between professional-level
                  cricket coaching and everyday players through intelligent AI analysis.
                </p>
                <p className="mission-p">
                  We aim to provide instant, data-driven feedback that empowers
                  cricketers to continuously improve their technique and performance.
                </p>
              </div>

              {/* Right — Diff Card */}
              <div className="diff-card">
               
                <div className="diff-label">Key Advantages</div>
                <h3 className="diff-h3">What Makes Us Different?</h3>
                <ul className="diff-list">
                  {[
                    "AI-based pose detection",
                    "Angle precision analysis",
                    "Personalized practice drill suggestions",
                  ].map((item) => (
                    <li className="diff-item" key={item}>
                      <div className="diff-item-left">
                        <div className="diff-check">
                          <svg viewBox="0 0 14 14">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 7l3.5 3.5L12 3" />
                          </svg>
                        </div>
                        {item}
                      </div>
                      <span className="diff-arrow">→</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ HOW IT WORKS ══════ */}
        <section className="how-section">
          <div className="section-sep" />
          <div className="how-inner">
            <h2 className="how-h2">How It <span>Works</span></h2>
            <div className="steps-grid">
              {[
                {  title: "1. Upload",  desc: "Upload your cricket batting image or video for AI analysis." },
                { title: "2. Analyze", desc: "Our AI detects body posture and calculates key angles." },
                { title: "3. Improve", desc: "Receive actionable feedback to sharpen your technique." },
              ].map((s) => (
                <div className="step-card" key={s.num}>
                  <span className="step-ghost-num">{s.num}</span>
                  <span className="step-top-line" />
                  <h3 className="step-h3">{s.title}</h3>
                  <p className="step-p">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
