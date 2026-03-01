import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Picupload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // "error" | "success" | "info"
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
    setMessage("Upload successful! Results are ready.");
    setMsgType("success");
  }

  function clear() {
    setFile(null);
    setPreview(null);
    setMessage("");
    setMsgType("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const fmtSize = (bytes) => bytes < 1024 * 1024
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
            repeating-linear-gradient(0deg,  rgba(66,255,78,0.03) 0px, rgba(66,255,78,0.03) 1px, transparent 1px, transparent 80px);
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

        /* ── card ── */
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

        /* back btn */
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

        /* heading */
        .pu-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          letter-spacing: 0.04em; color: #fff;
          line-height: 1; margin-bottom: 6px;
        }
        .pu-sub {
          font-size: 13px; font-weight: 300;
          color: rgba(230,239,230,0.35);
          margin-bottom: 32px;
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

        /* hidden file input */
        .pu-hidden-input { display: none; }

        /* ── preview ── */
        .pu-preview-wrap {
          margin-top: 24px;
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
        .pu-file-info {
          display: flex; align-items: center; gap: 10px;
        }
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
        .pu-file-size {
          font-size: 11px; font-weight: 400;
          color: rgba(230,239,230,0.3);
        }
        .pu-remove-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(230,239,230,0.3);
          display: flex; align-items: center;
          padding: 4px; border-radius: 6px;
          transition: color 0.2s, background 0.2s;
        }
        .pu-remove-btn:hover { color: #ff6b6b; background: rgba(255,107,107,0.1); }

        /* ── actions ── */
        .pu-actions {
          display: flex; gap: 12px;
          margin-top: 24px; flex-wrap: wrap;
        }

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

        /* spinner */
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(8,12,8,0.3);
          border-top-color: #080c08;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── message ── */
        .pu-message {
          display: flex; align-items: center; gap: 10px;
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          animation: cardIn 0.3s ease forwards;
        }
        .pu-message.error {
          background: rgba(255,107,107,0.1);
          border: 1px solid rgba(255,107,107,0.3);
          color: #ff8f8f;
        }
        .pu-message.success {
          background: rgba(66,255,78,0.1);
          border: 1px solid rgba(66,255,78,0.3);
          color: #42FF4E;
        }
        .pu-message.info {
          background: rgba(37,99,235,0.1);
          border: 1px solid rgba(37,99,235,0.3);
          color: #7baeff;
        }

        /* hints */
        .pu-hints {
          display: flex; gap: 20px;
          margin-top: 24px; flex-wrap: wrap;
        }
        .pu-hint {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 500;
          color: rgba(230,239,230,0.25);
          letter-spacing: 0.04em;
        }
        .pu-hint-dot { width: 4px; height: 4px; background: rgba(66,255,78,0.4); border-radius: 50%; }
      `}</style>

      <div className="pu-root">
        <div className="pu-blob-1" />
        <div className="pu-blob-2" />

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
          <p className="pu-sub">Upload a batting image for AI angle analysis</p>

          {/* Drop Zone */}
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

          {/* Preview */}
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

          {/* Message */}
          {message && (
            <div className={`pu-message ${msgType}`}>
              {msgType === "success" && (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {msgType === "error" && (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {msgType === "info" && (
                <div className="spinner" style={{ borderColor: "rgba(37,99,235,0.3)", borderTopColor: "#7baeff" }} />
              )}
              {message}
            </div>
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