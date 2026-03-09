import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Picupload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState("upload"); // "upload" | "webcam"
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState("");
  const [captured, setCaptured] = useState(false);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    if (captured) return; // already set from canvas
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, captured]);

  // Stop camera when switching away
  useEffect(() => {
    if (mode !== "webcam") stopCamera();
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamActive(false);
    setCaptured(false);
  }

  async function startCamera() {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCamActive(true);
      setCaptured(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setCamError("Camera access denied or unavailable. Please allow camera permissions.");
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const f = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = canvas.toDataURL("image/jpeg");
      setFile(f);
      setPreview(url);
      setCaptured(true);
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  function retakePhoto() {
    setFile(null);
    setPreview(null);
    setCaptured(false);
    startCamera();
  }

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      setMsgType("error");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setMessage("File too large — max 10MB.");
      setMsgType("error");
      return;
    }
    setMessage("");
    setCaptured(false);
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setMessage("Please drop an image file.");
      setMsgType("error");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setMessage("File too large — max 10MB.");
      setMsgType("error");
      return;
    }
    setMessage("");
    setFile(f);
  }

  async function handleUpload() {
    if (!file) { setMessage("No file selected."); setMsgType("error"); return; }
    setUploading(true);
    setMessage("Analysing technique…");
    setMsgType("info");
    await new Promise((r) => setTimeout(r, 1400));
    setUploading(false);
    navigate("/analyzing", { state: { file, preview } });
  }

  function clear() {
    setFile(null);
    setPreview(null);
    setMessage("");
    setMsgType("");
    setCaptured(false);
    if (inputRef.current) inputRef.current.value = "";
    if (mode === "webcam") startCamera();
  }

  const fmtSize = (bytes) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');

        .pu-root {
          min-height: 100vh;
          background: #080c08;
          background-image:
            repeating-linear-gradient(90deg, rgba(66,255,78,0.03) 0px, rgba(66,255,78,0.03) 1px, transparent 1px, transparent 80px),
            repeating-linear-gradient(0deg, rgba(66,255,78,0.03) 0px, rgba(66,255,78,0.03) 1px, transparent 1px, transparent 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Barlow', sans-serif;
          color: #e6efe6;
          position: relative;
          overflow: hidden;
        }
        .pu-blob-1 {
          position: fixed; top: -15%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(66,255,78,0.09) 0%, transparent 65%);
          pointer-events: none;
          animation: blobF 9s ease-in-out infinite;
        }
        .pu-blob-2 {
          position: fixed; bottom: -15%; right: -10%;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 65%);
          pointer-events: none;
          animation: blobF 12s ease-in-out infinite reverse;
        }
        @keyframes blobF {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(18px,-18px) scale(1.06); }
        }

        .pu-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 680px;
          background: #0d120d;
          border: 1px solid rgba(66,255,78,0.13);
          border-radius: 24px;
          padding: 48px 52px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
          opacity: 0; transform: translateY(24px);
        }
        @keyframes cardIn { to { opacity:1; transform:none; } }
        .pu-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #42FF4E, #2563EB, transparent);
          border-radius: 24px 24px 0 0;
        }
        @media(max-width:600px) { .pu-card { padding: 36px 24px; } }

        .pu-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #42FF4E; font-family: 'Barlow', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          padding: 0; margin-bottom: 28px;
          opacity: 0.7; transition: opacity 0.2s;
        }
        .pu-back:hover { opacity: 1; }

        .pu-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          letter-spacing: 0.04em; color: #fff;
          line-height: 1; margin-bottom: 6px;
        }
        .pu-sub {
          font-size: 13px; font-weight: 300;
          color: rgba(230,239,230,0.35);
          margin-bottom: 24px;
        }

        /* ── mode toggle ── */
        .pu-mode-toggle {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(66,255,78,0.12);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
          width: fit-content;
        }
        .pu-mode-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px;
          border: none; border-radius: 7px;
          font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          background: transparent;
          color: rgba(230,239,230,0.35);
        }
        .pu-mode-btn.active {
          background: rgba(66,255,78,0.15);
          color: #42FF4E;
          box-shadow: 0 0 0 1px rgba(66,255,78,0.25);
        }
        .pu-mode-btn:hover:not(.active) {
          color: rgba(230,239,230,0.6);
          background: rgba(255,255,255,0.05);
        }

        /* ── drop zone ── */
        .pu-dropzone {
          border: 2px dashed rgba(66,255,78,0.2);
          border-radius: 16px;
          padding: 40px 24px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: rgba(66,255,78,0.02);
          position: relative;
          min-height: 200px;
        }
        .pu-dropzone.dragging {
          border-color: #42FF4E;
          background: rgba(66,255,78,0.06);
          box-shadow: 0 0 0 4px rgba(66,255,78,0.08);
        }
        .pu-dropzone:hover {
          border-color: rgba(66,255,78,0.4);
          background: rgba(66,255,78,0.03);
        }
        .pu-upload-icon {
          width: 52px; height: 52px;
          background: rgba(66,255,78,0.1);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          transition: background 0.2s, transform 0.2s;
        }
        .pu-dropzone:hover .pu-upload-icon,
        .pu-dropzone.dragging .pu-upload-icon {
          background: rgba(66,255,78,0.18);
          transform: translateY(-3px);
        }
        .pu-upload-icon svg { color: #42FF4E; }
        .pu-drop-title {
          font-size: 15px; font-weight: 600;
          color: rgba(230,239,230,0.8);
          margin-bottom: 6px;
        }
        .pu-drop-sub {
          font-size: 12px; font-weight: 300;
          color: rgba(230,239,230,0.3);
          margin-bottom: 20px;
        }
        .pu-browse-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 22px;
          background: rgba(66,255,78,0.1);
          border: 1px solid rgba(66,255,78,0.25);
          border-radius: 8px;
          color: #42FF4E;
          font-family: 'Barlow', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .pu-browse-btn:hover { background: rgba(66,255,78,0.18); border-color: rgba(66,255,78,0.5); }
        .pu-hidden-input { display: none; }

        /* ── webcam area ── */
        .pu-cam-wrap {
          border: 1px solid rgba(66,255,78,0.15);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          background: #040804;
          min-height: 260px;
          display: flex; align-items: center; justify-content: center;
        }
        .pu-cam-video {
          width: 100%; max-height: 360px;
          object-fit: cover;
          display: block;
          border-radius: 0;
        }
        .pu-cam-video.hidden { display: none; }

        /* scan line overlay on live camera */
        .pu-cam-overlay {
          position: absolute; inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(66,255,78,0.015) 3px,
            rgba(66,255,78,0.015) 4px
          );
        }
        .pu-cam-corner {
          position: absolute;
          width: 20px; height: 20px;
          border-color: #42FF4E;
          border-style: solid;
          border-width: 0;
          opacity: 0.6;
        }
        .pu-cam-corner.tl { top: 12px; left: 12px; border-top-width: 2px; border-left-width: 2px; border-radius: 3px 0 0 0; }
        .pu-cam-corner.tr { top: 12px; right: 12px; border-top-width: 2px; border-right-width: 2px; border-radius: 0 3px 0 0; }
        .pu-cam-corner.bl { bottom: 12px; left: 12px; border-bottom-width: 2px; border-left-width: 2px; border-radius: 0 0 0 3px; }
        .pu-cam-corner.br { bottom: 12px; right: 12px; border-bottom-width: 2px; border-right-width: 2px; border-radius: 0 0 3px 0; }

        .pu-cam-idle {
          display: flex; flex-direction: column;
          align-items: center; gap: 14px;
          padding: 40px 24px;
          text-align: center;
        }
        .pu-cam-idle-icon {
          width: 60px; height: 60px;
          background: rgba(66,255,78,0.08);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .pu-cam-idle-icon svg { color: #42FF4E; }
        .pu-cam-idle-title {
          font-size: 15px; font-weight: 600;
          color: rgba(230,239,230,0.7);
        }
        .pu-cam-idle-sub {
          font-size: 12px; color: rgba(230,239,230,0.3);
          margin-top: -6px;
        }

        .pu-start-cam-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px;
          background: rgba(66,255,78,0.12);
          border: 1px solid rgba(66,255,78,0.3);
          border-radius: 8px;
          color: #42FF4E;
          font-family: 'Barlow', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .pu-start-cam-btn:hover { background: rgba(66,255,78,0.2); border-color: rgba(66,255,78,0.5); }

        .pu-cam-controls {
          display: flex; gap: 10px;
          padding: 12px 16px;
          background: rgba(5,10,5,0.9);
          border-top: 1px solid rgba(66,255,78,0.1);
          align-items: center; justify-content: center;
        }

        .pu-capture-btn {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #42FF4E;
          border: 3px solid rgba(255,255,255,0.2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 0 0 0 rgba(66,255,78,0.4);
        }
        .pu-capture-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 0 0 6px rgba(66,255,78,0.15);
        }
        .pu-capture-btn:active { transform: scale(0.96); }
        .pu-capture-btn svg { color: #080c08; }

        .pu-cam-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(230,239,230,0.3);
        }

        .pu-live-badge {
          position: absolute; top: 12px; left: 12px;
          display: flex; align-items: center; gap: 5px;
          background: rgba(8,12,8,0.75);
          border: 1px solid rgba(255,80,80,0.3);
          border-radius: 6px;
          padding: 4px 9px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #ff6b6b;
        }
        .pu-live-dot {
          width: 6px; height: 6px;
          background: #ff5050;
          border-radius: 50%;
          animation: livePulse 1.2s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ── preview (shared) ── */
        .pu-preview-wrap {
          border: 1px solid rgba(66,255,78,0.15);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          animation: cardIn 0.4s ease forwards;
        }
        .pu-preview-img {
          width: 100%; max-height: 340px;
          object-fit: contain;
          background: rgba(0,0,0,0.3);
          display: block;
        }
        .pu-preview-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 18px;
          background: rgba(5,10,5,0.9);
          border-top: 1px solid rgba(66,255,78,0.1);
        }
        .pu-file-info { display: flex; align-items: center; gap: 10px; }
        .pu-file-icon {
          width: 32px; height: 32px;
          background: rgba(66,255,78,0.1);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .pu-file-name {
          font-size: 13px; font-weight: 600;
          color: rgba(230,239,230,0.8);
          max-width: 240px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .pu-file-size { font-size: 11px; font-weight: 400; color: rgba(230,239,230,0.3); }
        .pu-remove-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(230,239,230,0.3);
          display: flex; align-items: center;
          padding: 4px; border-radius: 6px;
          transition: color 0.2s, background 0.2s;
        }
        .pu-remove-btn:hover { color: #ff6b6b; background: rgba(255,107,107,0.1); }
        .pu-retake-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(66,255,78,0.08);
          border: 1px solid rgba(66,255,78,0.2);
          border-radius: 6px;
          padding: 4px 12px;
          color: #42FF4E;
          font-family: 'Barlow', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s;
          margin-right: 8px;
        }
        .pu-retake-btn:hover { background: rgba(66,255,78,0.15); }

        /* ── actions ── */
        .pu-actions { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
        .pu-upload-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 14px 28px;
          background: #42FF4E; color: #080c08;
          border: none; border-radius: 10px;
          font-family: 'Barlow', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pu-upload-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
        .pu-upload-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(66,255,78,0.3);
        }
        .pu-upload-btn svg { transition: transform 0.2s; }
        .pu-upload-btn:not(:disabled):hover svg { transform: translateX(4px); }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(8,12,8,0.3);
          border-top-color: #080c08;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pu-message {
          display: flex; align-items: center; gap: 10px;
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          animation: cardIn 0.3s ease forwards;
        }
        .pu-message.error { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); color: #ff8f8f; }
        .pu-message.success { background: rgba(66,255,78,0.1); border: 1px solid rgba(66,255,78,0.3); color: #42FF4E; }
        .pu-message.info { background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.3); color: #7baeff; }

        .pu-hints { display: flex; gap: 20px; margin-top: 24px; flex-wrap: wrap; }
        .pu-hint {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 500;
          color: rgba(230,239,230,0.25);
          letter-spacing: 0.04em;
        }
        .pu-hint-dot { width: 4px; height: 4px; background: rgba(66,255,78,0.4); border-radius: 50%; }

        /* hidden canvas for capture */
        .pu-hidden-canvas { display: none; }
      `}</style>

      <div className="pu-root">
        <div className="pu-blob-1" />
        <div className="pu-blob-2" />
        <canvas ref={canvasRef} className="pu-hidden-canvas" />

        <div className="pu-card">

          {/* Back */}
          <button className="pu-back" onClick={() => navigate(-1)}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Heading */}
          <h2 className="pu-heading">Upload Picture</h2>
          <p className="pu-sub">Upload or capture a batting image for AI angle analysis</p>

          {/* Mode Toggle */}
          <div className="pu-mode-toggle">
            <button
              className={`pu-mode-btn${mode === "upload" ? " active" : ""}`}
              onClick={() => setMode("upload")}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
              </svg>
              Upload File
            </button>
            <button
              className={`pu-mode-btn${mode === "webcam" ? " active" : ""}`}
              onClick={() => { setMode("webcam"); }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Use Camera
            </button>
          </div>

          {/* ── UPLOAD MODE ── */}
          {mode === "upload" && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="pu-hidden-input"
                id="pu-file-input"
              />

              {!preview && (
                <label
                  htmlFor="pu-file-input"
                  className={`pu-dropzone${dragging ? " dragging" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <div className="pu-upload-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
                    </svg>
                  </div>
                  <p className="pu-drop-title">
                    {dragging ? "Drop it here!" : "Drag & drop your image here"}
                  </p>
                  <p className="pu-drop-sub">PNG, JPG, WEBP — max 10MB · Click or drag to upload</p>
                </label>
              )}

              {preview && (
                <div className="pu-preview-wrap">
                  <img src={preview} alt="Preview" className="pu-preview-img" />
                  <div className="pu-preview-bar">
                    <div className="pu-file-info">
                      <div className="pu-file-icon">
                        <svg width="16" height="16" fill="none" stroke="#42FF4E" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="pu-file-name">{file?.name}</div>
                        <div className="pu-file-size">{file ? fmtSize(file.size) : ""}</div>
                      </div>
                    </div>
                    <button className="pu-remove-btn" onClick={clear} title="Remove image">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── WEBCAM MODE ── */}
          {mode === "webcam" && (
            <>
              {/* Show camera or captured preview */}
              {!captured ? (
                <div className="pu-cam-wrap">
                  {!camActive ? (
                    <div className="pu-cam-idle">
                      <div className="pu-cam-idle-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                      </div>
                      <p className="pu-cam-idle-title">Camera not started</p>
                      <p className="pu-cam-idle-sub">Allow camera access when prompted</p>
                      <button className="pu-start-cam-btn" onClick={startCamera}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                        </svg>
                        Start Camera
                      </button>
                      {camError && (
                        <div className="pu-message error" style={{ marginTop: 0 }}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4M12 16h.01" />
                          </svg>
                          {camError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} className="pu-cam-video" autoPlay playsInline muted />
                      <div className="pu-cam-overlay" />
                      <div className="pu-cam-corner tl" />
                      <div className="pu-cam-corner tr" />
                      <div className="pu-cam-corner bl" />
                      <div className="pu-cam-corner br" />
                      <div className="pu-live-badge">
                        <div className="pu-live-dot" />
                        Live
                      </div>
                    </>
                  )}

                  {camActive && (
                    <div className="pu-cam-controls" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                      <span className="pu-cam-label">Capture</span>
                      <button className="pu-capture-btn" onClick={capturePhoto} title="Take photo">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </button>
                      <button
                        className="pu-remove-btn"
                        onClick={() => { stopCamera(); setMode("upload"); }}
                        title="Cancel camera"
                        style={{ padding: "8px" }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Captured image preview */
                <div className="pu-preview-wrap">
                  <img src={preview} alt="Captured" className="pu-preview-img" />
                  <div className="pu-preview-bar">
                    <div className="pu-file-info">
                      <div className="pu-file-icon">
                        <svg width="16" height="16" fill="none" stroke="#42FF4E" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </div>
                      <div>
                        <div className="pu-file-name">{file?.name}</div>
                        <div className="pu-file-size">{file ? fmtSize(file.size) : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <button className="pu-retake-btn" onClick={retakePhoto}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retake
                      </button>
                      <button className="pu-remove-btn" onClick={clear} title="Remove">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="pu-actions">
            <button
              className="pu-upload-btn"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <><div className="spinner" /> Analysing…</>
              ) : (
                <>
                  Analyse Technique
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Error messages only */}
          {message && msgType === "error" && (
            <div className={`pu-message ${msgType}`}>{message}</div>
          )}

          {/* Hints */}
          <div className="pu-hints">
            {["Side-on angle works best", "Good lighting recommended", "Single batter in frame"].map((h) => (
              <div className="pu-hint" key={h}>
                <span className="pu-hint-dot" />
                {h}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}