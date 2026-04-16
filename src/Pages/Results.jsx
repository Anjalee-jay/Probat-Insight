import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Components/Layout";

const TIPS = {
  stance:   ["Shift weight slightly more to back foot for better balance on short-pitched deliveries.", "Try widening stance by 2–3 cm to improve lateral movement."],
  grip:     ["Loosen bottom-hand grip pressure — aim for a 6/10 hold, not a 9/10.", "Roll wrists slightly inward at address to free the bat face through the line."],
  backlift: ["Excellent back-lift — maintain this natural high loop for off-side drives.", "Keep the bat face slightly open on the back-lift to improve cut-shot options."],
  elbow:    ["Raise the front elbow to at least 160° to open the hitting channel.", "Drill shadow batting with a resistance band on the front elbow to build muscle memory."],
  head:     ["Great stillness — focus on moving your head towards the ball earlier on full deliveries.", "Practice front-foot defensive drills to reinforce positive head position."],
};

function RadialScore({ score, color, size = 100 }) {
  const [animated, setAnimated] = useState(0);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v += 2;
      if (v >= score) { v = score; clearInterval(id); }
      setAnimated(v);
    }, 18);
    return () => clearInterval(id);
  }, [score]);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ filter: `drop-shadow(0 0 6px ${color}99)`, transition: "stroke-dasharray 0.02s linear" }}
      />
      <text x="50" y="47" textAnchor="middle" fill="#fff" fontSize="18" fontFamily="'Share Tech Mono', monospace" fontWeight="bold">{animated}</text>
      <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="'Barlow', sans-serif">/ 100</text>
    </svg>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const result = state?.result;
  const preview = state?.preview || result?.img_carc || state?.img_carc || null;
  const upload = state?.upload; // From uploads admin page

  const [activePos, setActivePos] = useState("stance");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const BATTING_POSITIONS = [
    {
      id: "stance",
      label: "Stance",
      score: result?.scores?.stance ?? 82,
      color: "#42FF4E",
      details: [
        { name: "Feet Width",      value: "Shoulder-width", status: "good" },
        { name: "Weight Balance",  value: "60/40 front",    status: "warn" },
        { name: "Knee Bend",       value: "Slight flex",    status: "good" },
      ],
    },
    {
      id: "grip_hands",
      label: "Grip & Hands",
      score: result?.scores?.grip_hands ?? 74,
      color: "#FFD94E",
      details: [
        { name: "Top Hand",        value: "Firm — correct", status: "good" },
        { name: "Bottom Hand",     value: "Over-gripped",   status: "bad"  },
        { name: "Wrist Position",  value: "Neutral",        status: "good" },
      ],
    },
    {
      id: "back_lift",
      label: "Back Lift",
      score: result?.scores?.back_lift ?? 91,
      color: "#00e5ff",
      details: [
        { name: "Lift Height",     value: "High — 165°",    status: "good" },
        { name: "Alignment",       value: "Straight",       status: "good" },
        { name: "Timing",          value: "Early",          status: "good" },
      ],
    },
    {
      id: "elbow_angle",
      label: "Elbow Angle",
      score: result?.scores?.elbow_angle ?? 68,
      color: "#FF6B6B",
      details: [
        { name: "Front Elbow",     value: "142° — low",     status: "bad"  },
        { name: "Rear Elbow",      value: "87° — correct",  status: "good" },
        { name: "Drive Channel",   value: "Slightly closed",status: "warn" },
      ],
    },
    {
      id: "head_position",
      label: "Head Position",
      score: result?.scores?.head_position ?? 88,
      color: "#B06EFF",
      details: [
        { name: "Eye Level",       value: "Parallel",       status: "good" },
        { name: "Still on impact", value: "Yes",            status: "good" },
        { name: "Forward lean",    value: "Slight",         status: "warn" },
      ],
    },
  ];

  const pos = BATTING_POSITIONS.find(p => p.id === activePos);
  const overallScore = result?.scores?.overall ?? Math.round(BATTING_POSITIONS.reduce((a, b) => a + b.score, 0) / BATTING_POSITIONS.length);
  const rawStroke = result?.stroke ?? result?.stroke_name ?? result?.predicted_stroke;
  const strokeName = rawStroke ? `${rawStroke}`.replace(/[-_]/g, " ").toUpperCase() : null;
  const rawConfidence = result?.stroke_confidence ?? result?.confidence;
  const confidenceLabel = rawConfidence != null
    ? `${Math.round(rawConfidence > 1 ? rawConfidence : rawConfidence * 100)}%`
    : null;
  const confidenceValue = rawConfidence != null
    ? Math.round(rawConfidence > 1 ? rawConfidence : rawConfidence * 100)
    : overallScore;

  return (
    <Layout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .rs-root {
          min-height: 100vh;
          background: #050808;
          background-image:
            radial-gradient(ellipse 70% 50% at 15% 60%, rgba(66,255,78,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 50% 70% at 85% 30%, rgba(0,229,255,0.03) 0%, transparent 70%),
            repeating-linear-gradient(90deg, rgba(66,255,78,0.012) 0px, rgba(66,255,78,0.012) 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(0deg,  rgba(66,255,78,0.012) 0px, rgba(66,255,78,0.012) 1px, transparent 1px, transparent 60px);
          font-family: 'Barlow', sans-serif;
          color: #e6efe6;
          display: flex;
          flex-direction: column;
          padding: 32px 40px 40px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .rs-root.mounted { opacity: 1; transform: none; }

        /* ── TOP NAV ── */
        .rs-topnav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .rs-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #42FF4E; font-family: 'Barlow', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          opacity: 0.6; transition: opacity 0.2s;
        }
        .rs-back:hover { opacity: 1; }
        .rs-nav-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(66,255,78,0.35);
          letter-spacing: 0.18em;
        }
        .rs-new-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 18px;
          background: rgba(66,255,78,0.08);
          border: 1px solid rgba(66,255,78,0.2);
          border-radius: 7px;
          color: #42FF4E;
          font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .rs-new-btn:hover { background: rgba(66,255,78,0.15); border-color: rgba(66,255,78,0.4); }

        /* ── HERO ROW ── */
        .rs-hero {
          display: flex;
          gap: 24px;
          margin-bottom: 28px;
          align-items: stretch;
        }

        /* overall score card */
        .rs-score-card {
          background: #0a0f0a;
          border: 1px solid rgba(66,255,78,0.15);
          border-radius: 18px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 28px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .rs-score-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #42FF4E, #00e5ff, transparent);
          border-radius: 18px 18px 0 0;
        }
        .rs-score-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 38px;
          letter-spacing: 0.06em;
          color: #fff;
          line-height: 1;
        }
        .rs-score-sub {
          font-size: 11px;
          color: rgba(230,239,230,0.3);
          font-weight: 300;
          margin-top: 4px;
          letter-spacing: 0.08em;
        }
        .rs-score-extra {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(230,239,230,0.65);
          line-height: 1.4;
          letter-spacing: 0.06em;
          max-width: 220px;
        }
        .rs-grade {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px;
          color: #42FF4E;
          line-height: 1;
          text-shadow: 0 0 30px rgba(66,255,78,0.4);
        }

        /* image preview card */
        .rs-img-card {
          flex: 1;
          background: #0a0f0a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          min-height: 160px;
        }
        .rs-img-card img {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.7;
        }
        .rs-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: repeating-linear-gradient(
            45deg,
            rgba(66,255,78,0.02) 0px,
            rgba(66,255,78,0.02) 4px,
            transparent 4px,
            transparent 20px
          );
          color: rgba(66,255,78,0.15);
          font-size: 40px;
        }
        .rs-img-overlay {
          position: absolute; bottom: 12px; left: 14px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(66,255,78,0.5);
          letter-spacing: 0.12em;
          background: rgba(5,8,8,0.7);
          padding: 4px 8px;
          border-radius: 4px;
        }

        /* ── MAIN GRID ── */
        .rs-grid {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 20px;
          flex: 1;
        }

        /* position list */
        .rs-pos-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rs-pos-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .rs-pos-btn:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
        .rs-pos-btn.active {
          border-color: var(--pos-color);
          background: rgba(0,0,0,0.3);
          box-shadow: 0 0 0 1px var(--pos-color-faint), inset 0 0 20px rgba(0,0,0,0.3);
        }
        .rs-pos-circle {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid var(--pos-color);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          color: var(--pos-color);
          transition: all 0.2s;
        }
        .rs-pos-btn.active .rs-pos-circle {
          background: var(--pos-color);
          color: #050808;
        }
        .rs-pos-name {
          font-size: 13px;
          font-weight: 500;
          color: rgba(230,239,230,0.6);
          transition: color 0.2s;
        }
        .rs-pos-btn.active .rs-pos-name { color: #fff; }
        .rs-pos-score-mini {
          margin-left: auto;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: var(--pos-color);
          opacity: 0.7;
        }

        /* detail panel */
        .rs-detail {
          background: #0a0f0a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          overflow: hidden;
        }
        .rs-detail::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          border-radius: 18px 18px 0 0;
          background: linear-gradient(90deg, var(--active-color, #42FF4E), transparent);
          transition: background 0.3s;
        }

        .rs-detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rs-detail-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.06em;
          color: #fff;
        }

        /* detail metrics */
        .rs-detail-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .rs-dm-card {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          padding: 14px 16px;
          border-left: 3px solid transparent;
        }
        .rs-dm-card.good { border-color: #42FF4E; }
        .rs-dm-card.warn { border-color: #FFD94E; }
        .rs-dm-card.bad  { border-color: #FF6B6B; }
        .rs-dm-name {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(230,239,230,0.3);
          margin-bottom: 6px;
        }
        .rs-dm-value {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }
        .rs-dm-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          margin-top: 6px;
          letter-spacing: 0.06em;
        }
        .rs-dm-status.good { color: #42FF4E; }
        .rs-dm-status.warn { color: #FFD94E; }
        .rs-dm-status.bad  { color: #FF6B6B; }

        /* improvement tips */
        .rs-tips-section {}
        .rs-tips-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background: none;
          border: 1px solid rgba(255,217,78,0.2);
          border-radius: 10px;
          padding: 12px 18px;
          cursor: pointer;
          color: #FFD94E;
          font-family: 'Barlow', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: left;
          transition: all 0.2s;
        }
        .rs-tips-toggle:hover { background: rgba(255,217,78,0.06); border-color: rgba(255,217,78,0.4); }
        .rs-tips-toggle.open { background: rgba(255,217,78,0.06); border-color: rgba(255,217,78,0.35); border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none; }
        .rs-tips-toggle-icon { margin-left: auto; font-size: 16px; transition: transform 0.3s; }
        .rs-tips-toggle.open .rs-tips-toggle-icon { transform: rotate(180deg); }
        .rs-tips-body {
          border: 1px solid rgba(255,217,78,0.2);
          border-top: none;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease;
        }
        .rs-tips-body.open { max-height: 300px; }
        .rs-tip-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,217,78,0.07);
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
        .rs-tip-item:last-child { border-bottom: none; }
        @keyframes fadeUp { to { opacity:1; transform:none; } }
        .rs-tip-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          border: 1px solid rgba(255,217,78,0.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: #FFD94E;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .rs-tip-text {
          font-size: 13px;
          font-weight: 400;
          color: rgba(230,239,230,0.65);
          line-height: 1.5;
        }
      `}</style>

      <div className={`rs-root${mounted ? " mounted" : ""}`}>

        {/* TOP NAV */}
        <div className="rs-topnav">
          <button className="rs-back" onClick={() => navigate(-1)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="rs-nav-title">ANALYSIS COMPLETE · BATTING REPORT</span>
          <button className="rs-new-btn" onClick={() => navigate("/picupload")}>
            + New Analysis
          </button>
        </div>

        {/* HERO ROW */}
        <div className="rs-hero">
          <div className="rs-score-card">
            <div>
              <div className="rs-score-label">
                {strokeName ? `${strokeName} STROKE` : "Overall Score"}
              </div>
              <div className="rs-score-sub">BATTING TECHNIQUE · {overallScore}/100</div>
              {strokeName && confidenceLabel && (
                <div className="rs-score-extra">
                  CONFIDENCE: {confidenceLabel}
                </div>
              )}
            </div>
            <RadialScore score={confidenceValue} color="#42FF4E" size={110} />
            <div className="rs-grade">
              {confidenceValue >= 85 ? "A" : confidenceValue >= 70 ? "B" : confidenceValue >= 55 ? "C" : "D"}
            </div>
          </div>

          <div className="rs-img-card">
            {preview
              ? <img src={preview} alt="Batting frame" />
              : <div className="rs-img-placeholder">◎</div>
            }
            <div className="rs-img-overlay">ANALYSED FRAME · AI PROCESSED</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="rs-grid">

          {/* Position List */}
          <div className="rs-pos-list">
            {BATTING_POSITIONS.map(p => (
              <button
                key={p.id}
                className={`rs-pos-btn${activePos === p.id ? " active" : ""}`}
                style={{ "--pos-color": p.color, "--pos-color-faint": p.color + "22" }}
                onClick={() => setActivePos(p.id)}
              >
                <div className="rs-pos-circle">{p.score}</div>
                <span className="rs-pos-name">{p.label}</span>
                <span className="rs-pos-score-mini">
                  {p.score >= 85 ? "✓✓" : p.score >= 70 ? "✓" : "!"}
                </span>
              </button>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="rs-detail" style={{ "--active-color": pos.color }}>
            <div className="rs-detail-header">
              <div>
                <div className="rs-detail-title">{pos.label}</div>
              </div>
              <RadialScore score={pos.score} color={pos.color} size={80} />
            </div>

            <div className="rs-detail-metrics">
              {pos.details.map((d, i) => (
                <div key={i} className={`rs-dm-card ${d.status}`}>
                  <div className="rs-dm-name">{d.name}</div>
                  <div className="rs-dm-value">{d.value}</div>
                  <div className={`rs-dm-status ${d.status}`}>
                    {d.status === "good" ? "● OPTIMAL" : d.status === "warn" ? "▲ REVIEW" : "✕ IMPROVE"}
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement Tips → DrillSuggest */}
            <div className="rs-tips-section">
              <button
                className="rs-tips-toggle"
                onClick={() => navigate("/drillsuggest", { state: { position: pos, tips: TIPS[pos.id], overallScore } })}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Improvement Tips
                <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  &nbsp;— {TIPS[pos.id].length} suggestions
                </span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: "auto" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  </Layout>
  );
}