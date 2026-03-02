import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const STAGES = [
  { id: 1, label: "Uploading Footage",        sub: "Transferring video to secure server",         duration: 2000 },
  { id: 2, label: "Extracting Frames",         sub: "Isolating key batting moments",               duration: 2500 },
  { id: 3, label: "Pose Detection",            sub: "Mapping 33 body keypoints per frame",         duration: 3000 },
  { id: 4, label: "Biomechanical Analysis",    sub: "Calculating joint angles & swing arc",        duration: 2800 },
  { id: 5, label: "Technique Scoring",         sub: "Comparing against elite batting profiles",    duration: 2200 },
  { id: 6, label: "Generating Insights",       sub: "Building personalised drill recommendations", duration: 1800 },
];

const METRICS = [
  { label: "Elbow Angle",    unit: "°",  final: 142, color: "#42FF4E" },
  { label: "Bat Speed",      unit: " km/h", final: 87, color: "#00e5ff" },
  { label: "Head Position",  unit: "%",  final: 94, color: "#a78bfa" },
  { label: "Footwork Score", unit: "%",  final: 78, color: "#ff6b35" },
];

export default function Analyzing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  const [currentStage, setCurrentStage]   = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [overallPct, setOverallPct]       = useState(0);
  const [metricVals, setMetricVals]       = useState(METRICS.map(() => 0));
  const [done, setDone]                   = useState(false);
  const [particles, setParticles]         = useState([]);
  const [scanLine, setScanLine]           = useState(0);

  /* ── overall progress ── */
  useEffect(() => {
    let total = 0;
    let idx   = 0;

    const tick = () => {
      if (idx >= STAGES.length) { setDone(true); return; }
      const stage = STAGES[idx];
      const steps = 100;
      const interval = stage.duration / steps;
      let step = 0;

      const id = setInterval(() => {
        step++;
        setStageProgress(step);
        const completedPct = (idx / STAGES.length) * 100;
        setOverallPct(Math.round(completedPct + (step / steps) * (100 / STAGES.length)));
        if (step >= steps) {
          clearInterval(id);
          idx++;
          total += stage.duration;
          setCurrentStage(idx);
          setStageProgress(0);
          tick();
        }
      }, interval);
    };
    tick();
  }, []);

  /* ── metric counters ── */
  useEffect(() => {
    const ids = METRICS.map((m, i) => {
      const delay = 2500 + i * 800;
      return setTimeout(() => {
        let v = 0;
        const id = setInterval(() => {
          v += Math.ceil(m.final / 60);
          if (v >= m.final) { v = m.final; clearInterval(id); }
          setMetricVals(prev => { const n = [...prev]; n[i] = v; return n; });
        }, 25);
      }, delay);
    });
    return () => ids.forEach(clearTimeout);
  }, []);

  /* ── scan line ── */
  useEffect(() => {
    let y = 0;
    const id = setInterval(() => {
      y = (y + 1.2) % 100;
      setScanLine(y);
    }, 16);
    return () => clearInterval(id);
  }, []);

  /* ── canvas particle skeleton ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    /* skeleton keypoints: simplified human figure */
    const W = canvas.width, H = canvas.height;
    const cx = W / 2;
    const scale = Math.min(W, H) * 0.55;

    const kps = [
      // head
      { x: cx,           y: H*0.12 },
      // shoulders
      { x: cx - 0.14*scale, y: H*0.22 },
      { x: cx + 0.14*scale, y: H*0.22 },
      // elbows
      { x: cx - 0.24*scale, y: H*0.38 },
      { x: cx + 0.24*scale, y: H*0.38 },
      // wrists
      { x: cx - 0.28*scale, y: H*0.54 },
      { x: cx + 0.28*scale, y: H*0.54 },
      // hips
      { x: cx - 0.1*scale,  y: H*0.52 },
      { x: cx + 0.1*scale,  y: H*0.52 },
      // knees
      { x: cx - 0.12*scale, y: H*0.70 },
      { x: cx + 0.12*scale, y: H*0.70 },
      // ankles
      { x: cx - 0.10*scale, y: H*0.88 },
      { x: cx + 0.10*scale, y: H*0.88 },
    ];

    const bones = [
      [1,2],[1,3],[2,4],[3,5],[4,6],[5,7],
      [2,8],[3,9],[8,9],[8,10],[9,11],[10,12],[11,13],
      [0,1],[0,2],
    ];

    /* floating particles */
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    }));

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      const t = frame / 60;

      /* grid */
      ctx.strokeStyle = "rgba(66,255,78,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      /* animated keypoints */
      const animKps = kps.map((p, i) => ({
        x: p.x + Math.sin(t * 1.2 + i * 0.7) * 2,
        y: p.y + Math.cos(t * 0.9 + i * 0.5) * 2,
      }));

      /* bones */
      bones.forEach(([a, b]) => {
        const pa = animKps[a], pb = animKps[b];
        const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
        grad.addColorStop(0, "rgba(66,255,78,0.7)");
        grad.addColorStop(1, "rgba(0,229,255,0.7)");
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      /* keypoint dots */
      animKps.forEach((p, i) => {
        const pulse = 0.6 + 0.4 * Math.sin(t * 2 + i);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(66,255,78,${0.5 + 0.5 * pulse})`;
        ctx.fill();
        /* glow ring */
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(66,255,78,${0.15 * pulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      /* angle arc on elbow */
      const elbow = animKps[3];
      ctx.beginPath();
      ctx.arc(elbow.x, elbow.y, 18, -0.5, 0.9);
      ctx.strokeStyle = "rgba(0,229,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0,229,255,0.8)";
      ctx.font = "bold 10px 'Barlow', sans-serif";
      ctx.fillText("142°", elbow.x + 22, elbow.y - 6);

      /* floating particles */
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(66,255,78,${p.a * 0.4})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        .az-root {
          min-height: 100vh;
          background: #050805;
          font-family: 'Barlow', sans-serif;
          color: #e6efe6;
          display: grid;
          grid-template-columns: 1fr 380px;
          grid-template-rows: auto 1fr;
          overflow: hidden;
          position: relative;
        }

        /* ambient glows */
        .az-glow-1 {
          position: fixed; top: -100px; left: -80px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(66,255,78,0.08) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
          animation: glowPulse 4s ease-in-out infinite;
        }
        .az-glow-2 {
          position: fixed; bottom: -100px; right: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
          animation: glowPulse 6s ease-in-out infinite reverse;
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.8; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }

        /* ── Header bar ── */
        .az-header {
          grid-column: 1 / -1;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 36px;
          border-bottom: 1px solid rgba(66,255,78,0.1);
          background: rgba(5,8,5,0.9);
          backdrop-filter: blur(12px);
          position: relative; z-index: 10;
        }
        .az-header-left { display: flex; align-items: center; gap: 14px; }
        .az-logo-dot {
          width: 10px; height: 10px; border-radius: 50%; background: #42FF4E;
          box-shadow: 0 0 12px #42FF4E;
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%,100% { transform: scale(1); box-shadow: 0 0 12px #42FF4E; }
          50%      { transform: scale(1.4); box-shadow: 0 0 20px #42FF4E; }
        }
        .az-header-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px; color: #fff;
        }
        .az-header-title span { color: #42FF4E; }

        .az-status-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 20px;
          background: rgba(66,255,78,0.08); border: 1px solid rgba(66,255,78,0.2);
          font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: #42FF4E;
        }
        .az-status-badge.done-badge {
          background: rgba(0,229,255,0.08); border-color: rgba(0,229,255,0.2); color: #00e5ff;
        }
        .az-status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #42FF4E;
          animation: dotPulse 1s infinite;
        }

        .az-overall-pct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: rgba(255,255,255,0.5);
        }
        .az-overall-pct span {
          font-size: 20px; font-weight: 500; color: #42FF4E;
        }

        /* ── Left: canvas ── */
        .az-canvas-wrap {
          position: relative;
          grid-column: 1; grid-row: 2;
          background: #080c08;
          border-right: 1px solid rgba(66,255,78,0.08);
          overflow: hidden;
          min-height: 0;
        }

        .az-canvas {
          width: 100%; height: 100%;
          display: block;
        }

        /* scan line overlay */
        .az-scanline {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(66,255,78,0.6), rgba(0,229,255,0.4), transparent);
          pointer-events: none;
          box-shadow: 0 0 20px rgba(66,255,78,0.4);
          transition: top 0.016s linear;
        }

        /* corner brackets */
        .az-corner {
          position: absolute; width: 24px; height: 24px;
          border-color: rgba(66,255,78,0.5); border-style: solid;
          pointer-events: none;
        }
        .az-corner.tl { top: 16px; left: 16px; border-width: 2px 0 0 2px; }
        .az-corner.tr { top: 16px; right: 16px; border-width: 2px 2px 0 0; }
        .az-corner.bl { bottom: 16px; left: 16px; border-width: 0 0 2px 2px; }
        .az-corner.br { bottom: 16px; right: 16px; border-width: 0 2px 2px 0; }

        /* canvas label */
        .az-canvas-label {
          position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(66,255,78,0.5);
          background: rgba(5,8,5,0.7); padding: 4px 12px; border-radius: 4px;
          border: 1px solid rgba(66,255,78,0.1);
        }

        /* ── Right panel ── */
        .az-panel {
          grid-column: 2; grid-row: 2;
          display: flex; flex-direction: column; gap: 0;
          overflow-y: auto; background: #080c08;
          position: relative; z-index: 1;
        }
        .az-panel::-webkit-scrollbar { width: 3px; }
        .az-panel::-webkit-scrollbar-thumb { background: rgba(66,255,78,0.2); border-radius: 2px; }

        .az-panel-section {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(66,255,78,0.06);
        }

        .az-section-title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(66,255,78,0.5);
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        .az-section-title::after {
          content: ''; flex: 1; height: 1px; background: rgba(66,255,78,0.1);
        }

        /* Stage list */
        .az-stage-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 10px 0; position: relative;
        }
        .az-stage-item:not(:last-child)::after {
          content: ''; position: absolute; left: 11px; top: 32px;
          width: 1px; height: calc(100% - 10px);
          background: rgba(66,255,78,0.1);
        }

        .az-stage-dot {
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; margin-top: 1px;
          transition: all 0.3s;
        }
        .az-stage-dot.waiting {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.2);
        }
        .az-stage-dot.active {
          background: rgba(66,255,78,0.15); border: 1px solid rgba(66,255,78,0.5);
          color: #42FF4E; box-shadow: 0 0 12px rgba(66,255,78,0.3);
          animation: activePulse 1s ease-in-out infinite;
        }
        @keyframes activePulse {
          0%,100% { box-shadow: 0 0 8px rgba(66,255,78,0.3); }
          50%      { box-shadow: 0 0 18px rgba(66,255,78,0.6); }
        }
        .az-stage-dot.done {
          background: #42FF4E; border: 1px solid #42FF4E; color: #050805;
        }

        .az-stage-info { flex: 1; min-width: 0; }
        .az-stage-label {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85);
          margin-bottom: 3px; transition: color 0.3s;
        }
        .az-stage-label.active { color: #42FF4E; }
        .az-stage-label.done { color: rgba(255,255,255,0.4); }
        .az-stage-sub { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.4; }

        /* stage progress bar */
        .az-stage-bar-wrap {
          height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px;
          margin-top: 8px; overflow: hidden;
        }
        .az-stage-bar-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, #42FF4E, #00e5ff);
          transition: width 0.1s linear;
          box-shadow: 0 0 6px rgba(66,255,78,0.5);
        }

        .az-stage-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: rgba(255,255,255,0.2); margin-top: 4px;
        }
        .az-stage-time.active { color: rgba(66,255,78,0.6); }

        /* Metrics */
        .az-metric-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .az-metric-item:last-child { border-bottom: none; }

        .az-metric-color { width: 3px; height: 32px; border-radius: 2px; flex-shrink: 0; }
        .az-metric-info { flex: 1; }
        .az-metric-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px; letter-spacing: 0.06em; }
        .az-metric-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 20px; font-weight: 500; line-height: 1;
        }
        .az-metric-bar { width: 80px; }
        .az-metric-bar-bg { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .az-metric-bar-fill { height: 100%; border-radius: 2px; transition: width 0.05s linear; }

        /* Overall ring */
        .az-ring-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 20px 24px;
        }
        .az-ring-svg { transform: rotate(-90deg); }
        .az-ring-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 6; }
        .az-ring-fill {
          fill: none; stroke-width: 6; stroke-linecap: round;
          transition: stroke-dashoffset 0.2s linear;
        }
        .az-ring-center { text-align: center; }
        .az-ring-pct {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px; letter-spacing: 1px; line-height: 1;
          color: #42FF4E;
        }
        .az-ring-sub { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.3); }

        /* Done overlay */
        .az-done-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.4s ease both;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .az-done-card {
          background: #0d120d;
          border: 1px solid rgba(66,255,78,0.2);
          border-radius: 24px; padding: 48px 52px;
          text-align: center; max-width: 440px; width: 100%;
          position: relative; overflow: hidden;
          animation: cardPop 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardPop {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to   { opacity: 1; transform: none; }
        }
        .az-done-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, #42FF4E, transparent);
        }

        .az-done-icon {
          width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px;
          background: rgba(66,255,78,0.12); border: 2px solid rgba(66,255,78,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; box-shadow: 0 0 40px rgba(66,255,78,0.3);
          animation: iconPop 0.6s 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes iconPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .az-done-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 38px; letter-spacing: 2px; color: #fff; margin-bottom: 8px;
        }
        .az-done-title span { color: #42FF4E; }
        .az-done-sub { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 28px; }

        .az-done-scores {
          display: flex; gap: 16px; justify-content: center; margin-bottom: 28px;
        }
        .az-done-score {
          flex: 1; padding: 14px 10px; border-radius: 12px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        }
        .az-done-score-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; line-height: 1; margin-bottom: 4px;
        }
        .az-done-score-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); }

        .az-done-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          background: #42FF4E; color: #050805;
          font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 8px 32px rgba(66,255,78,0.25);
        }
        .az-done-btn:hover { background: #5fff6a; transform: translateY(-2px); box-shadow: 0 14px 40px rgba(66,255,78,0.35); }
        .az-done-btn svg { width: 16px; height: 16px; }

        @media (max-width: 768px) {
          .az-root { grid-template-columns: 1fr; grid-template-rows: auto 300px 1fr; }
          .az-canvas-wrap { grid-column: 1; grid-row: 2; min-height: 300px; }
          .az-panel { grid-column: 1; grid-row: 3; }
          .az-header { padding: 14px 20px; }
        }
      `}</style>

      <div className="az-root">
        <div className="az-glow-1" />
        <div className="az-glow-2" />

        {/* ── Header ── */}
        <div className="az-header">
          <div className="az-header-left">
            <div className="az-logo-dot" />
            <div className="az-header-title">PLAYER<span>IQ</span></div>
            <div style={{ width: 1, height: 20, background: "rgba(66,255,78,0.2)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Batting Analysis
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="az-overall-pct">
              <span>{overallPct}</span>%
            </div>
            <div className={`az-status-badge ${done ? "done-badge" : ""}`}>
              {!done && <div className="az-status-dot" />}
              {done ? "Complete" : "Processing"}
            </div>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div className="az-canvas-wrap">
          <canvas ref={canvasRef} className="az-canvas" />
          <div className="az-scanline" style={{ top: `${scanLine}%` }} />
          <div className="az-corner tl" />
          <div className="az-corner tr" />
          <div className="az-corner bl" />
          <div className="az-corner br" />
          <div className="az-canvas-label">Pose Detection · Live</div>
        </div>

        {/* ── Right Panel ── */}
        <div className="az-panel">

          {/* Overall ring */}
          <div className="az-ring-wrap">
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg className="az-ring-svg" width="110" height="110" viewBox="0 0 110 110">
                <circle className="az-ring-bg" cx="55" cy="55" r="48" />
                <circle
                  className="az-ring-fill"
                  cx="55" cy="55" r="48"
                  stroke={overallPct > 80 ? "#42FF4E" : overallPct > 50 ? "#00e5ff" : "#ff6b35"}
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - overallPct / 100)}`}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div className="az-ring-pct">{overallPct}</div>
                <div className="az-ring-sub">Overall</div>
              </div>
            </div>
          </div>

          {/* Stage list */}
          <div className="az-panel-section">
            <div className="az-section-title">Pipeline Stages</div>
            {STAGES.map((stage, i) => {
              const state = i < currentStage ? "done" : i === currentStage ? "active" : "waiting";
              return (
                <div className="az-stage-item" key={stage.id}>
                  <div className={`az-stage-dot ${state}`}>
                    {state === "done" ? "✓" : state === "active" ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="3" fill="#42FF4E">
                          <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                    ) : stage.id}
                  </div>
                  <div className="az-stage-info">
                    <div className={`az-stage-label ${state}`}>{stage.label}</div>
                    <div className="az-stage-sub">{stage.sub}</div>
                    {state === "active" && (
                      <>
                        <div className="az-stage-bar-wrap">
                          <div className="az-stage-bar-fill" style={{ width: `${stageProgress}%` }} />
                        </div>
                        <div className={`az-stage-time ${state}`}>
                          {stageProgress}% — processing...
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live metrics */}
          <div className="az-panel-section">
            <div className="az-section-title">Live Metrics</div>
            {METRICS.map((m, i) => (
              <div className="az-metric-item" key={m.label}>
                <div className="az-metric-color" style={{ background: m.color }} />
                <div className="az-metric-info">
                  <div className="az-metric-label">{m.label}</div>
                  <div className="az-metric-val" style={{ color: m.color }}>
                    {metricVals[i]}{m.unit}
                  </div>
                </div>
                <div className="az-metric-bar">
                  <div className="az-metric-bar-bg">
                    <div
                      className="az-metric-bar-fill"
                      style={{
                        width: `${(metricVals[i] / m.final) * 100}%`,
                        background: m.color,
                        boxShadow: `0 0 6px ${m.color}`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Done overlay ── */}
      {done && (
        <div className="az-done-overlay">
          <div className="az-done-card">
            <div className="az-done-icon">✓</div>
            <div className="az-done-title">Analysis <span>Complete</span></div>
            <div className="az-done-sub">
              Your batting technique has been fully analysed.<br />
              Your personalised report is ready to view.
            </div>
            <div className="az-done-scores">
              <div className="az-done-score">
                <div className="az-done-score-val" style={{ color: "#42FF4E" }}>87</div>
                <div className="az-done-score-label">Overall Score</div>
              </div>
              <div className="az-done-score">
                <div className="az-done-score-val" style={{ color: "#00e5ff" }}>142°</div>
                <div className="az-done-score-label">Elbow Angle</div>
              </div>
              <div className="az-done-score">
                <div className="az-done-score-val" style={{ color: "#a78bfa" }}>94%</div>
                <div className="az-done-score-label">Head Position</div>
              </div>
            </div>
            <button className="az-done-btn" onClick={() => navigate("/")}>
              View Full Report
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}