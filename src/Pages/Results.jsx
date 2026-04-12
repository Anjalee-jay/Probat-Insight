import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Components/Layout";

const formatStrokeName = (stroke) => {
  if (!stroke) return null;
  return stroke
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
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
  const preview = state?.preview;
  const result = state?.result;

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const techniques = result && result.scores ? [
    { label: "Stance", score: Math.round(result.scores.stance), color: "#42FF4E" },
    { label: "Grip & Hands", score: Math.round(result.scores.grip_hands), color: "#FFD94E" },
    { label: "Back Lift", score: Math.round(result.scores.back_lift), color: "#00e5ff" },
    { label: "Elbow Angle", score: Math.round(result.scores.elbow_angle), color: "#FF6B6B" },
    { label: "Head Position", score: Math.round(result.scores.head_position), color: "#B06EFF" },
  ] : [
    { label: "Stance", score: 82, color: "#42FF4E" },
    { label: "Grip & Hands", score: 74, color: "#FFD94E" },
    { label: "Back Lift", score: 91, color: "#00e5ff" },
    { label: "Elbow Angle", score: 68, color: "#FF6B6B" },
    { label: "Head Position", score: 88, color: "#B06EFF" },
  ];

  const overallScore = result && result.scores ? Math.round(result.scores.overall) : Math.round(techniques.reduce((a, b) => a + b.score, 0) / techniques.length);
  const strokeName = result && result.stroke ? formatStrokeName(result.stroke) : "Unknown Stroke";
  const strokeConfidence = result && result.stroke_confidence ? Math.round(result.stroke_confidence * 100) : null;

  return (
    <Layout>
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

        .rs-header {
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
        .rs-title {
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

        .rs-main {
          display: flex;
          gap: 32px;
          flex: 1;
        }

        .rs-image-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .rs-image-card {
          background: #0a0f0a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          aspect-ratio: 16/9;
        }
        .rs-image-card img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .rs-image-placeholder {
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
        .rs-stroke-display {
          background: #0a0f0a;
          border: 1px solid rgba(0,229,255,0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .rs-stroke-label {
          font-size: 12px;
          color: rgba(0,229,255,0.6);
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .rs-stroke-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          color: #00e5ff;
          letter-spacing: 0.05em;
        }
        .rs-stroke-confidence {
          font-size: 14px;
          color: rgba(0,229,255,0.7);
          margin-top: 4px;
        }

        .rs-confidence-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .rs-overall-card {
          background: #0a0f0a;
          border: 1px solid rgba(66,255,78,0.15);
          border-radius: 18px;
          padding: 28px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .rs-overall-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #42FF4E, #00e5ff, transparent);
        }
        .rs-overall-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          letter-spacing: 0.06em;
          color: #fff;
          margin-bottom: 8px;
        }
        .rs-overall-sub {
          font-size: 11px;
          color: rgba(230,239,230,0.3);
          font-weight: 300;
          letter-spacing: 0.08em;
          margin-bottom: 20px;
        }
        .rs-overall-grade {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          color: #42FF4E;
          text-shadow: 0 0 30px rgba(66,255,78,0.4);
          margin-bottom: 20px;
        }

        .rs-techniques-card {
          background: #0a0f0a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 28px;
          flex: 1;
        }
        .rs-techniques-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 0.06em;
          color: #fff;
          margin-bottom: 20px;
        }
        .rs-techniques-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }
        .rs-tech-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .rs-tech-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(230,239,230,0.6);
          text-align: center;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className={`rs-root${mounted ? " mounted" : ""}`}>

        <div className="rs-header">
          <button className="rs-back" onClick={() => navigate(-1)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="rs-title">ANALYSIS RESULTS</span>
          <button className="rs-new-btn" onClick={() => navigate("/picupload")}>
            + New Analysis
          </button>
        </div>

        <div className="rs-main">

          <div className="rs-image-section">
            <div className="rs-image-card">
              {preview
                ? <img src={preview} alt="Analyzed batting image" />
                : <div className="rs-image-placeholder">◎</div>
              }
            </div>

            <div className="rs-stroke-display">
              <div className="rs-stroke-label">Detected Stroke</div>
              <div className="rs-stroke-name">{strokeName}</div>
              {strokeConfidence !== null && (
                <div className="rs-stroke-confidence">
                  Confidence: {strokeConfidence}%
                </div>
              )}
            </div>
          </div>

          <div className="rs-confidence-section">

            <div className="rs-overall-card">
              <div className="rs-overall-label">Overall Confidence</div>
              <div className="rs-overall-sub">BATTING TECHNIQUE SCORE</div>
              <RadialScore score={overallScore} color="#42FF4E" size={120} />
              <div className="rs-overall-grade">
                {overallScore >= 85 ? "A" : overallScore >= 70 ? "B" : overallScore >= 55 ? "C" : "D"}
              </div>
            </div>

            <div className="rs-techniques-card">
              <div className="rs-techniques-title">Technique Confidence</div>
              <div className="rs-techniques-grid">
                {techniques.map((tech, index) => (
                  <div key={index} className="rs-tech-item">
                    <RadialScore score={tech.score} color={tech.color} size={80} />
                    <div className="rs-tech-label">{tech.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}