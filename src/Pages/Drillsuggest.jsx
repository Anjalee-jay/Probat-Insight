import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Components/Layout";

const DRILL_LIBRARY = {
  stance: [
    {
      name: "Balance Board Drill",
      level: "Beginner",
      duration: "10 min",
      reps: "3 × 2 min",
      focus: "Weight distribution & stability",
      steps: [
        "Stand on a balance board in your batting stance",
        "Hold position for 30 seconds, eyes closed",
        "Shift weight 60/40 front then 60/40 back on command",
        "Return to neutral — repeat 4 times per set",
      ],
    },
    {
      name: "Stump Width Stance",
      level: "Intermediate",
      duration: "15 min",
      reps: "5 × 10 shadow swings",
      focus: "Foot positioning & lateral movement",
      steps: [
        "Place two stumps shoulder-width apart as foot guides",
        "Take stance with feet just outside the stumps",
        "Practice lateral shuffle while maintaining width",
        "Shadow bat 10 drives without moving feet outside guides",
      ],
    },
  ],
  grip: [
    {
      name: "Newspaper Roll Drill",
      level: "Beginner",
      duration: "5 min",
      reps: "Daily — 3 sets",
      focus: "Bottom hand pressure control",
      steps: [
        "Roll a newspaper tightly and grip it like a bat handle",
        "Squeeze with bottom hand only — feel the 6/10 pressure",
        "Shadow the off-drive motion without unrolling the paper",
        "Progress to using the actual bat once pressure is memorised",
      ],
    },
    {
      name: "Wrist Roll Shadow Bat",
      level: "Intermediate",
      duration: "10 min",
      reps: "4 × 15 reps",
      focus: "Wrist release through the line",
      steps: [
        "Start at the top of your back-lift with correct grip",
        "Drive through imaginary ball — roll wrists naturally at contact",
        "Freeze at follow-through and check wrist position",
        "Film from behind to verify wrist roll is inward, not outward",
      ],
    },
  ],
  backlift: [
    {
      name: "High Lift Mirror Drill",
      level: "Beginner",
      duration: "10 min",
      reps: "3 × 20 lifts",
      focus: "Maintaining back-lift height under fatigue",
      steps: [
        "Stand side-on to a full-length mirror",
        "Lift bat to full height — check it reaches shoulder level",
        "Hold for 2 seconds, lower slowly, repeat",
        "Add a step-and-drive at rep 10 to simulate match pressure",
      ],
    },
    {
      name: "Tee Timing Drill",
      level: "Intermediate",
      duration: "20 min",
      reps: "4 × 10 hits",
      focus: "Early back-lift into controlled drive",
      steps: [
        "Set batting tee at stumps height",
        "Initiate back-lift before the coach calls 'now'",
        "Drive off the tee — measure contact consistency",
        "Goal: 8/10 clean hits per set before advancing",
      ],
    },
  ],
  elbow: [
    {
      name: "Resistance Band Elbow Drill",
      level: "Intermediate",
      duration: "15 min",
      reps: "3 × 12 reps each arm",
      focus: "Raising front elbow above 160°",
      steps: [
        "Attach resistance band to front wrist, anchor low",
        "Adopt batting stance — feel band pulling elbow down",
        "Drive bat through line, consciously lifting front elbow against resistance",
        "Freeze at contact — elbow must be above shoulder height",
      ],
    },
    {
      name: "Elbow Ledge Drill",
      level: "Beginner",
      duration: "10 min",
      reps: "Daily — 50 shadow swings",
      focus: "Front elbow muscle memory",
      steps: [
        "Place a foam pad or book on your front shoulder",
        "Shadow bat — the pad must stay balanced throughout the swing",
        "If pad falls, elbow dropped below target angle",
        "Progress to dropping pad on command mid-swing for reflex training",
      ],
    },
  ],
  head: [
    {
      name: "Target Stare Drill",
      level: "Beginner",
      duration: "10 min",
      reps: "3 × 15 shadow deliveries",
      focus: "Head stillness at impact",
      steps: [
        "Stick a small sticker on the bowling crease at delivery point",
        "Keep eyes locked on sticker from back-lift through contact",
        "Have a partner call 'still' at moment of impact — freeze and check",
        "Head must not rotate more than 5° before bat reaches contact zone",
      ],
    },
    {
      name: "Front Foot Lead Drill",
      level: "Intermediate",
      duration: "20 min",
      reps: "4 × 8 full deliveries",
      focus: "Moving head towards the ball",
      steps: [
        "Partner throws full-length deliveries on off-stump",
        "Drive front foot 30cm forward before bat comes down",
        "Head should travel in same direction as front foot",
        "Film side-on to verify nose is over front knee at contact",
      ],
    },
  ],
};

function LevelBadge({ level }) {
  const colors = {
    Beginner: { bg: "rgba(66,255,78,0.1)", border: "rgba(66,255,78,0.3)", text: "#42FF4E" },
    Intermediate: { bg: "rgba(255,217,78,0.1)", border: "rgba(255,217,78,0.3)", text: "#FFD94E" },
    Advanced: { bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.3)", text: "#FF6B6B" },
  };
  const c = colors[level] || colors.Beginner;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 4,
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.text,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      {level.toUpperCase()}
    </span>
  );
}

export default function DrillSuggest() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const position = state?.position;
  const tips = state?.tips || [];
  const overallScore = state?.overallScore || 80;

  const drills = DRILL_LIBRARY[position?.id] || DRILL_LIBRARY.stance;
  const [activeDrill, setActiveDrill] = useState(0);
  const [expandedStep, setExpandedStep] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const drill = drills[activeDrill];

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ds-root {
          min-height: 100vh;
          background: #050808;
          background-image:
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(255,217,78,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 80%, rgba(66,255,78,0.03) 0%, transparent 70%),
            repeating-linear-gradient(90deg, rgba(66,255,78,0.012) 0px, rgba(66,255,78,0.012) 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(0deg,  rgba(66,255,78,0.012) 0px, rgba(66,255,78,0.012) 1px, transparent 1px, transparent 60px);
          font-family: 'Barlow', sans-serif;
          color: #e6efe6;
          padding: 32px 40px 48px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ds-root.mounted { opacity: 1; transform: none; }

        /* NAV */
        .ds-topnav {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 32px;
        }
        .ds-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #42FF4E; font-family: 'Barlow', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          opacity: 0.6; transition: opacity 0.2s;
        }
        .ds-back:hover { opacity: 1; }
        .ds-nav-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; color: rgba(255,217,78,0.4);
          letter-spacing: 0.18em;
        }

        /* HEADER */
        .ds-header {
          margin-bottom: 28px;
        }
        .ds-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 0.22em;
          color: rgba(255,217,78,0.5); text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ds-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          letter-spacing: 0.06em; color: #fff; line-height: 1;
          margin-bottom: 6px;
        }
        .ds-title span { color: #FFD94E; }
        .ds-subtitle {
          font-size: 13px; font-weight: 300;
          color: rgba(230,239,230,0.3); letter-spacing: 0.06em;
        }

        /* LAYOUT */
        .ds-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* TIPS CARD */
        .ds-tips-card {
          background: #0a0f0a;
          border: 1px solid rgba(255,217,78,0.12);
          border-radius: 18px;
          padding: 26px 28px;
          position: relative;
          overflow: hidden;
        }
        .ds-tips-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #FFD94E, transparent);
          border-radius: 18px 18px 0 0;
        }
        .ds-card-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(255,217,78,0.45); margin-bottom: 16px;
        }
        .ds-tip-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          animation: fadeUp 0.4s ease forwards;
          opacity: 0; transform: translateY(8px);
        }
        .ds-tip-row:last-child { border-bottom: none; }
        @keyframes fadeUp { to { opacity:1; transform:none; } }
        .ds-tip-icon {
          width: 28px; height: 28px;
          background: rgba(255,217,78,0.1);
          border: 1px solid rgba(255,217,78,0.2);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #FFD94E; font-size: 12px;
        }
        .ds-tip-text {
          font-size: 13px; font-weight: 400;
          color: rgba(230,239,230,0.6); line-height: 1.55;
        }

        /* DRILL SELECTOR */
        .ds-drill-card {
          background: #0a0f0a;
          border: 1px solid rgba(66,255,78,0.12);
          border-radius: 18px;
          padding: 26px 28px;
          position: relative;
          overflow: hidden;
          display: flex; flex-direction: column; gap: 20px;
        }
        .ds-drill-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #42FF4E, #00e5ff, transparent);
          border-radius: 18px 18px 0 0;
        }

        .ds-drill-tabs {
          display: flex; gap: 8px;
        }
        .ds-drill-tab {
          flex: 1; padding: 8px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          cursor: pointer; transition: all 0.2s;
          text-align: center;
          font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 600;
          color: rgba(230,239,230,0.4);
          letter-spacing: 0.04em;
        }
        .ds-drill-tab:hover { border-color: rgba(66,255,78,0.2); color: rgba(230,239,230,0.7); }
        .ds-drill-tab.active {
          background: rgba(66,255,78,0.08);
          border-color: rgba(66,255,78,0.3);
          color: #42FF4E;
        }

        .ds-drill-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
        }
        .ds-drill-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px; letter-spacing: 0.05em; color: #fff;
          line-height: 1;
        }

        .ds-drill-meta {
          display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;
        }
        .ds-meta-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          font-size: 11px; font-weight: 500;
          color: rgba(230,239,230,0.45);
        }
        .ds-meta-chip svg { opacity: 0.5; }

        .ds-focus-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          background: rgba(0,229,255,0.07);
          border: 1px solid rgba(0,229,255,0.18);
          border-radius: 6px;
          font-size: 11px; font-weight: 600;
          color: #00e5ff; letter-spacing: 0.08em;
        }

        /* Steps */
        .ds-steps-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(66,255,78,0.4);
        }
        .ds-steps { display: flex; flex-direction: column; gap: 8px; }
        .ds-step {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          cursor: pointer; transition: all 0.2s;
          animation: fadeUp 0.4s ease forwards;
          opacity: 0; transform: translateY(6px);
        }
        .ds-step:hover { background: rgba(66,255,78,0.04); border-color: rgba(66,255,78,0.15); }
        .ds-step.expanded { background: rgba(66,255,78,0.06); border-color: rgba(66,255,78,0.2); }
        .ds-step-num {
          width: 24px; height: 24px; border-radius: 6px;
          background: rgba(66,255,78,0.12);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; color: #42FF4E; flex-shrink: 0;
        }
        .ds-step-text {
          font-size: 13px; font-weight: 400;
          color: rgba(230,239,230,0.6); line-height: 1.5;
          flex: 1;
        }
        .ds-step.expanded .ds-step-text { color: rgba(230,239,230,0.85); }

        /* bottom CTA */
        .ds-cta-row {
          display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap;
        }
        .ds-cta-primary {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 14px 28px;
          background: #42FF4E; color: #050808;
          border: none; border-radius: 10px;
          font-family: 'Barlow', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .ds-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(66,255,78,0.25); }
        .ds-cta-secondary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 22px;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-family: 'Barlow', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(230,239,230,0.4);
          cursor: pointer; transition: all 0.2s;
        }
        .ds-cta-secondary:hover { border-color: rgba(255,255,255,0.25); color: rgba(230,239,230,0.7); }
      `}</style>

      <div className={`ds-root${mounted ? " mounted" : ""}`}>

        {/* NAV */}
        <div className="ds-topnav">
          <button className="ds-back" onClick={() => navigate(-1)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Results
          </button>
          <span className="ds-nav-title">DRILL SUGGESTIONS · AI COACH</span>
          <span style={{ width: 120 }} />
        </div>

        {/* HEADER */}
        <div className="ds-header">
          <div className="ds-eyebrow">Personalised Training Plan</div>
          <div className="ds-title">
            Improve Your <span>{position?.label || "Technique"}</span>
          </div>
          <div className="ds-subtitle">
            Based on your analysis · {drills.length} drills recommended
          </div>
        </div>

        {/* LAYOUT */}
        <div className="ds-layout">

          {/* LEFT — Tips */}
          <div className="ds-tips-card">
            <div className="ds-card-label">Coach Insights</div>
            {tips.map((tip, i) => (
              <div
                key={i}
                className="ds-tip-row"
                style={{ animationDelay: `${0.1 + i * 0.12}s` }}
              >
                <div className="ds-tip-icon">💡</div>
                <div className="ds-tip-text">{tip}</div>
              </div>
            ))}
          </div>

          {/* RIGHT — Drills */}
          <div className="ds-drill-card">
            <div className="ds-card-label">Recommended Drills</div>

            {/* Drill Tabs */}
            <div className="ds-drill-tabs">
              {drills.map((d, i) => (
                <button
                  key={i}
                  className={`ds-drill-tab${activeDrill === i ? " active" : ""}`}
                  onClick={() => { setActiveDrill(i); setExpandedStep(null); }}
                >
                  Drill {i + 1}
                </button>
              ))}
            </div>

            {/* Drill Header */}
            <div>
              <div className="ds-drill-header">
                <div>
                  <div className="ds-drill-name">{drill.name}</div>
                  <div className="ds-drill-meta">
                    <div className="ds-meta-chip">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      {drill.duration}
                    </div>
                    <div className="ds-meta-chip">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      {drill.reps}
                    </div>
                  </div>
                </div>
                <LevelBadge level={drill.level} />
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="ds-focus-tag">◎ {drill.focus}</div>
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="ds-steps-label" style={{ marginBottom: 10 }}>Step-by-Step</div>
              <div className="ds-steps">
                {drill.steps.map((step, i) => (
                  <div
                    key={i}
                    className={`ds-step${expandedStep === i ? " expanded" : ""}`}
                    style={{ animationDelay: `${0.05 * i}s` }}
                    onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  >
                    <div className="ds-step-num">{i + 1}</div>
                    <div className="ds-step-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="ds-cta-row">
          <button className="ds-cta-primary" onClick={() => navigate("/results", { state: { position, tips, overallScore } })}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Full Report
          </button>
          <button className="ds-cta-secondary" onClick={() => navigate("/picupload")}>
            + New Analysis
          </button>
        </div>

      </div>
    </Layout>
  );
}