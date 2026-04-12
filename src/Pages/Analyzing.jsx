import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Components/Layout";

const STAGES = [
  { label: "Uploading Footage",  duration: 2000, icon: "⬆" },
  { label: "Extracting Frames",  duration: 2000, icon: "⬡" },
  { label: "Pose Detection",     duration: 2500, icon: "◎" },
  { label: "Angle Calculation",  duration: 2000, icon: "∠" },
  { label: "Technique Analysis", duration: 2000, icon: "◈" },
  { label: "Generating Report",  duration: 2000, icon: "▣" },
];

const getMetrics = (result) => {
  if (!result || !result.scores) {
    return [
      { label: "Elbow Angle",    value: 142, unit: "°",    color: "#42FF4E" },
      { label: "Bat Speed",      value: 87,  unit: "km/h", color: "#00e5ff" },
      { label: "Head Position",  value: 94,  unit: "%",    color: "#FFD94E" },
      { label: "Footwork Score", value: 78,  unit: "%",    color: "#FF6B6B" },
    ];
  }
  const scores = result.scores;
  return [
    { label: "Stance",       value: Math.round(scores.stance),       unit: "%", color: "#42FF4E" },
    { label: "Grip & Hands", value: Math.round(scores.grip_hands),   unit: "%", color: "#00e5ff" },
    { label: "Back Lift",    value: Math.round(scores.back_lift),    unit: "%", color: "#FFD94E" },
    { label: "Elbow Angle",  value: Math.round(scores.elbow_angle),  unit: "%", color: "#FF6B6B" },
  ];
};

export default function Analyzing() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const scanLineRef = useRef(0);

  const { result } = location.state || {};
  const { preview } = location.state || {};
  const METRICS = getMetrics(result);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState(METRICS.map(() => 0));
  const [completedStages, setCompletedStages] = useState([]);

  /* ── Progress ── */
  useEffect(() => {
    let index = 0;
    const runStage = () => {
      if (index >= STAGES.length) {
        setTimeout(() => navigate("/results", { state: { result } }), 1500);
        return;
      }
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setProgress(step);
        if (step >= 100) {
          clearInterval(interval);
          setCompletedStages(prev => [...prev, index]);
          index++;
          setStage(index);
          setProgress(0);
          runStage();
        }
      }, STAGES[index].duration / 100);
    };
    runStage();
  }, [navigate, result]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Metrics Count-up ── */
  useEffect(() => {
    const timers = METRICS.map((m, i) =>
      setTimeout(() => {
        let v = 0;
        const id = setInterval(() => {
          v += Math.ceil(m.value / 40);
          if (v >= m.value) { v = m.value; clearInterval(id); }
          setMetrics(prev => { const a = [...prev]; a[i] = v; return a; });
        }, 30);
      }, 2000 + i * 600)
    );
    return () => timers.forEach(clearTimeout);
  }, [METRICS]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Scan Line ── */
  useEffect(() => {
    let pos = 0;
    const id = setInterval(() => {
      pos = (pos + 1) % 100;
      scanLineRef.current = pos;
    }, 20);
    return () => clearInterval(id);
  }, []);

  /* ── Skeleton Canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Cricket batting pose keypoints
    const keypoints = [
      { x: 0.50, y: 0.08 }, // 0 head
      { x: 0.48, y: 0.18 }, // 1 neck
      { x: 0.38, y: 0.22 }, // 2 left shoulder
      { x: 0.60, y: 0.20 }, // 3 right shoulder
      { x: 0.30, y: 0.36 }, // 4 left elbow
      { x: 0.70, y: 0.34 }, // 5 right elbow
      { x: 0.25, y: 0.50 }, // 6 left wrist (bat top)
      { x: 0.72, y: 0.48 }, // 7 right wrist
      { x: 0.45, y: 0.52 }, // 8 left hip
      { x: 0.55, y: 0.52 }, // 9 right hip
      { x: 0.42, y: 0.72 }, // 10 left knee
      { x: 0.58, y: 0.72 }, // 11 right knee
      { x: 0.40, y: 0.90 }, // 12 left ankle
      { x: 0.60, y: 0.90 }, // 13 right ankle
    ];

    const bones = [
      [0,1],[1,2],[1,3],[2,4],[4,6],[3,5],[5,7],[2,8],[3,9],[8,9],[8,10],[10,12],[9,11],[11,13]
    ];

    // Bat
    const bat = [
      { x: 0.25, y: 0.50 },
      { x: 0.15, y: 0.72 },
    ];

    let frame = 0;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      frame += 0.025;

      // Body sway
      const sway = Math.sin(frame) * 2;
      const pts = keypoints.map((p, i) => ({
        x: p.x * W + Math.sin(frame + i * 0.4) * 2 + sway * 0.3,
        y: p.y * H + Math.cos(frame * 0.8 + i * 0.3) * 1.5,
      }));

      // Scan line highlight
      const scanY = (scanLineRef.current / 100) * H;

      // Glow bones
      bones.forEach(([a, b]) => {
        const pa = pts[a], pb = pts[b];
        if (!pa || !pb) return;

        const midY = (pa.y + pb.y) / 2;
        const glowIntensity = Math.max(0, 1 - Math.abs(midY - scanY) / 80);

        // outer glow
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = `rgba(66,255,78,${0.08 + glowIntensity * 0.25})`;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.stroke();

        // core line
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = `rgba(66,255,78,${0.5 + glowIntensity * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Bat
      const batPts = bat.map(p => ({
        x: p.x * W + Math.sin(frame) * 2,
        y: p.y * H + Math.cos(frame * 0.8) * 1.5
      }));
      ctx.beginPath();
      ctx.moveTo(batPts[0].x, batPts[0].y);
      ctx.lineTo(batPts[1].x, batPts[1].y);
      ctx.strokeStyle = "rgba(255,217,78,0.9)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Joints
      pts.forEach((p, i) => {
        const distToScan = Math.abs(p.y - scanY);
        const glow = Math.max(0, 1 - distToScan / 60);

        // outer ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7 + glow * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${0.06 + glow * 0.15})`;
        ctx.fill();

        // core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${0.7 + glow * 0.3})`;
        ctx.fill();
      });

      // Angle arc at elbow (left)
      const elbow = pts[4];
      ctx.beginPath();
      ctx.arc(elbow.x, elbow.y, 22, -0.3, 1.2);
      ctx.strokeStyle = "rgba(255,217,78,0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "bold 11px 'Courier New'";
      ctx.fillStyle = "rgba(255,217,78,0.9)";
      ctx.fillText("142°", elbow.x + 18, elbow.y - 12);

      // Scan line
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(W, scanY);
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, "rgba(66,255,78,0.04)");
      grad.addColorStop(0.5, "rgba(66,255,78,0.12)");
      grad.addColorStop(0.7, "rgba(66,255,78,0.04)");
      grad.addColorStop(1, "transparent");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Corner brackets
      const bSize = 16;
      const bPad = 20;
      const corners = [
        { x: bPad, y: bPad, dx1: 1, dy1: 0, dx2: 0, dy2: 1 },
        { x: W - bPad, y: bPad, dx1: -1, dy1: 0, dx2: 0, dy2: 1 },
        { x: bPad, y: H - bPad, dx1: 1, dy1: 0, dx2: 0, dy2: -1 },
        { x: W - bPad, y: H - bPad, dx1: -1, dy1: 0, dx2: 0, dy2: -1 },
      ];
      corners.forEach(c => {
        ctx.beginPath();
        ctx.moveTo(c.x + c.dx1 * bSize, c.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(c.x, c.y + c.dy2 * bSize);
        ctx.strokeStyle = "rgba(66,255,78,0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const overallProgress = ((completedStages.length * 100) + progress) / STAGES.length;

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .an-root {
          min-height: 100vh;
          background: #050808;
          background-image:
            radial-gradient(ellipse 60% 40% at 30% 50%, rgba(66,255,78,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 75% 50%, rgba(0,229,255,0.03) 0%, transparent 70%),
            repeating-linear-gradient(90deg, rgba(66,255,78,0.015) 0px, rgba(66,255,78,0.015) 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(0deg,  rgba(66,255,78,0.015) 0px, rgba(66,255,78,0.015) 1px, transparent 1px, transparent 60px);
          display: flex;
          font-family: 'Barlow', sans-serif;
          color: #e6efe6;
          overflow: hidden;
          height: 100vh;
        }

        /* ── LEFT ── */
        .an-left {
          flex: 1;
          position: relative;
          border-right: 1px solid rgba(66,255,78,0.1);
          overflow: hidden;
        }

        .an-image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .an-image {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0.9;
        }

        .an-canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .an-top-badge {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(5,8,8,0.85);
          border: 1px solid rgba(66,255,78,0.2);
          border-radius: 4px;
          padding: 6px 16px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: #42FF4E;
          backdrop-filter: blur(8px);
        }

        .an-pulse-dot {
          width: 6px; height: 6px;
          background: #42FF4E;
          border-radius: 50%;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(0.6); }
        }

        .an-bottom-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: rgba(66,255,78,0.08);
          overflow: hidden;
        }
        .an-bottom-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #42FF4E, #00e5ff);
          box-shadow: 0 0 12px rgba(66,255,78,0.8);
          transition: width 0.1s linear;
        }

        .an-frame-counter {
          position: absolute;
          bottom: 16px;
          left: 20px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(66,255,78,0.35);
          letter-spacing: 0.12em;
        }

        .an-coords {
          position: absolute;
          bottom: 16px;
          right: 20px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(66,255,78,0.35);
          letter-spacing: 0.12em;
        }

        /* ── RIGHT ── */
        .an-right {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .an-right::-webkit-scrollbar { display: none; }

        /* header strip */
        .an-header {
          padding: 28px 28px 20px;
          border-bottom: 1px solid rgba(66,255,78,0.08);
        }
        .an-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 30px;
          letter-spacing: 0.08em;
          color: #fff;
          line-height: 1;
        }
        .an-subtitle {
          font-size: 11px;
          color: rgba(230,239,230,0.3);
          font-weight: 300;
          margin-top: 4px;
          letter-spacing: 0.06em;
        }
        .an-detected-stroke {
          font-size: 12px;
          color: #00e5ff;
          font-weight: 500;
          margin-top: 8px;
          letter-spacing: 0.05em;
        }

        /* overall progress */
        .an-overall {
          padding: 20px 28px;
          border-bottom: 1px solid rgba(66,255,78,0.08);
        }
        .an-overall-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .an-overall-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: rgba(66,255,78,0.5);
          text-transform: uppercase;
        }
        .an-overall-pct {
          font-family: 'Share Tech Mono', monospace;
          font-size: 22px;
          color: #42FF4E;
        }
        .an-overall-track {
          height: 4px;
          background: rgba(66,255,78,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .an-overall-fill {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #42FF4E 0%, #00e5ff 100%);
          box-shadow: 0 0 8px rgba(66,255,78,0.6);
          transition: width 0.15s linear;
        }

        /* stages */
        .an-stages {
          padding: 20px 28px;
          border-bottom: 1px solid rgba(66,255,78,0.08);
          flex: none;
        }
        .an-section-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: rgba(66,255,78,0.4);
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .an-stage-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .an-stage-row.done {
          border-color: rgba(66,255,78,0.1);
          background: rgba(66,255,78,0.04);
        }
        .an-stage-row.active {
          border-color: rgba(66,255,78,0.25);
          background: rgba(66,255,78,0.07);
          box-shadow: 0 0 16px rgba(66,255,78,0.06);
        }
        .an-stage-row.pending {
          opacity: 0.3;
        }

        .an-stage-icon {
          width: 26px; height: 26px;
          border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .an-stage-row.done .an-stage-icon {
          background: rgba(66,255,78,0.15);
          color: #42FF4E;
        }
        .an-stage-row.active .an-stage-icon {
          background: rgba(66,255,78,0.2);
          color: #42FF4E;
          animation: iconPulse 1s ease-in-out infinite;
        }
        .an-stage-row.pending .an-stage-icon {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.2);
        }
        @keyframes iconPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(66,255,78,0); }
          50% { box-shadow: 0 0 0 5px rgba(66,255,78,0.15); }
        }

        .an-stage-info { flex: 1; min-width: 0; }
        .an-stage-name {
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .an-stage-row.done .an-stage-name { color: rgba(66,255,78,0.7); }
        .an-stage-row.active .an-stage-name { color: #fff; }
        .an-stage-row.pending .an-stage-name { color: rgba(255,255,255,0.3); }

        .an-stage-bar-wrap {
          height: 2px;
          background: rgba(66,255,78,0.1);
          border-radius: 1px;
          margin-top: 5px;
          overflow: hidden;
        }
        .an-stage-bar {
          height: 100%;
          border-radius: 1px;
          background: #42FF4E;
          box-shadow: 0 0 6px rgba(66,255,78,0.8);
          transition: width 0.1s linear;
        }

        .an-stage-check {
          width: 16px; height: 16px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
        }
        .an-stage-row.done .an-stage-check { color: #42FF4E; }
        .an-stage-row.active .an-stage-check { color: rgba(66,255,78,0.3); }
        .an-stage-row.pending .an-stage-check { color: rgba(255,255,255,0.1); }

        /* metrics */
        .an-metrics {
          padding: 20px 28px;
          flex: 1;
        }

        .an-metric-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        @keyframes fadeUp {
          to { opacity:1; transform:none; }
        }

        .an-metric-left { display: flex; align-items: center; gap: 10px; }
        .an-metric-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .an-metric-label {
          font-size: 12px;
          font-weight: 400;
          color: rgba(230,239,230,0.45);
        }
        .an-metric-value {
          font-family: 'Share Tech Mono', monospace;
          font-size: 20px;
          font-weight: 400;
        }

        .an-stroke {
          padding: 20px 28px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .an-stroke-name {
          font-size: 18px;
          font-weight: 600;
          color: #00e5ff;
          text-align: center;
          margin-top: 10px;
        }

        .an-metric-bar-container {
          margin-top: 8px;
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 1px;
          overflow: hidden;
        }
        .an-metric-bar {
          height: 100%;
          border-radius: 1px;
          transition: width 0.04s linear;
        }

        /* footer */
        .an-footer {
          padding: 16px 28px;
          border-top: 1px solid rgba(66,255,78,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .an-status-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(66,255,78,0.4);
          letter-spacing: 0.12em;
        }
        .an-blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      <div className="an-root">

        {/* ── LEFT ── */}
        <div className="an-left">
          <div className="an-image-container">
            {preview && <img src={preview} alt="Analyzing batting image" className="an-image" />}
            <canvas ref={canvasRef} className="an-canvas" />
          </div>

          <div className="an-top-badge">
            <div className="an-pulse-dot" />
            AI POSE DETECTION — LIVE
          </div>

          <div className="an-frame-counter">
            FRAME {String(Math.floor(Date.now() / 33) % 9999).padStart(4, "0")} · 30FPS
          </div>
          <div className="an-coords">
            13 KEYPOINTS TRACKED
          </div>

          <div className="an-bottom-bar">
            <div className="an-bottom-bar-fill" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="an-right">

          <div className="an-header">
            <div className="an-title">ANALYSING</div>
            <div className="an-subtitle">BATTING TECHNIQUE · AI PROCESSING</div>
            {result && result.stroke && (
              <div className="an-detected-stroke">DETECTED STROKE: {result.stroke.toUpperCase().replace('-', ' ')}</div>
            )}
          </div>

          <div className="an-overall">
            <div className="an-overall-row">
              <span className="an-overall-label">Overall Progress</span>
              <span className="an-overall-pct">{Math.round(overallProgress)}%</span>
            </div>
            <div className="an-overall-track">
              <div className="an-overall-fill" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>

          <div className="an-stages">
            <div className="an-section-title">Process Stages</div>
            {STAGES.map((s, i) => {
              const status = completedStages.includes(i) ? "done" : i === stage ? "active" : "pending";
              return (
                <div key={i} className={`an-stage-row ${status}`}>
                  <div className="an-stage-icon">{s.icon}</div>
                  <div className="an-stage-info">
                    <div className="an-stage-name">{s.label}</div>
                    {status === "active" && (
                      <div className="an-stage-bar-wrap">
                        <div className="an-stage-bar" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="an-stage-check">
                    {status === "done" ? "✓" : status === "active" ? "▶" : "○"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="an-metrics">
            <div className="an-section-title">Live Metrics</div>
            {METRICS.map((m, i) => (
              <div
                key={i}
                className="an-metric-card"
                style={{ animationDelay: `${2 + i * 0.5}s` }}
              >
                <div>
                  <div className="an-metric-left">
                    <div className="an-metric-dot" style={{ background: m.color }} />
                    <div className="an-metric-label">{m.label}</div>
                  </div>
                  <div className="an-metric-bar-container">
                    <div
                      className="an-metric-bar"
                      style={{
                        width: `${(metrics[i] / m.value) * 100}%`,
                        background: m.color,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>
                <div className="an-metric-value" style={{ color: m.color }}>
                  {metrics[i]}<span style={{ fontSize: 12, opacity: 0.6 }}>{m.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {result && result.stroke && (
            <div className="an-stroke">
              <div className="an-section-title">Detected Stroke</div>
              <div className="an-stroke-name">{result.stroke.replace('-', ' ').toUpperCase()}</div>
            </div>
          )}

          <div className="an-footer">
            <span className="an-status-text">
              SYS · PROCESSING<span className="an-blink">_</span>
            </span>
            <span className="an-status-text">
              STAGE {Math.min(stage + 1, STAGES.length)}/{STAGES.length}
            </span>
          </div>

        </div>
      </div>
    </Layout>
  );
}