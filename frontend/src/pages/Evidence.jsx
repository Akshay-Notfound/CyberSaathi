import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import EntityPanel from "../components/EntityPanel";
import useComplaintStore from "../store/complaintStore";
import useStore from "../store/useStore";

export default function Evidence() {
  const outlet = useOutletContext();
  const store = useStore();
  const complaintId = outlet?.complaintId || store.activeComplaintId;
  const { evidence, fetchEvidence, uploadEvidence, deleteEvidence } = useComplaintStore();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (complaintId) {
      fetchEvidence(complaintId);
    }
  }, [complaintId]);

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setError("");
    setUploading(true);
    try {
      for (const file of files) {
        await uploadEvidence(complaintId, file);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please check the file type and size.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <h1 style={{
        fontFamily: "var(--font-display, sans-serif)",
        fontSize: "1.3rem",
        fontWeight: 600,
        color: "#f8fafc",
        margin: 0,
      }}>
        Evidence
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px", marginBottom: "24px" }}>
        Upload screenshots, PDFs, or receipts. Text is extracted automatically via OCR and folded into your case.
      </p>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => fileInputRef.current?.click()}
        id="evidence-dropzone"
        style={{
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          border: `2px dashed ${dragOver ? "#f59e0b" : "rgba(59, 130, 246, 0.25)"}`,
          backgroundColor: dragOver ? "rgba(245, 158, 11, 0.05)" : "rgba(15, 23, 42, 0.45)",
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ marginBottom: "12px", color: "#94a3b8" }}>
          <path d="M12 16V4M12 4 7 9M12 4l5 5" />
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>

        <p style={{ fontSize: "0.9rem", color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
          {uploading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="spinner" style={{ width: 16, height: 16 }} />
              Uploading and analyzing with OCR...
            </span>
          ) : (
            "Drag files here, or click to browse"
          )}
        </p>

        <p style={{
          marginTop: "6px",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.72rem",
          color: "#64748b",
          margin: "6px 0 0",
        }}>
          PNG, JPG, PDF · up to 15MB each
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.bmp,.tiff,.pdf"
          style={{ display: "none" }}
          id="evidence-file-input"
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
      </div>

      {error && (
        <p style={{
          marginTop: "12px",
          fontSize: "0.85rem",
          color: "#f87171",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          padding: "8px 12px",
          borderRadius: "6px",
        }}>
          {error}
        </p>
      )}

      {/* Uploaded Evidence list */}
      <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {evidence.map((ev) => (
          <div
            key={ev.id}
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              background: "rgba(15, 23, 42, 0.6)",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#f8fafc",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {ev.filename}
                </p>
                <p style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  color: "#64748b",
                  marginTop: "2px",
                  margin: "2px 0 0",
                }}>
                  {ev.file_type} {ev.document_type ? `· ${ev.document_type}` : ""}
                </p>
              </div>

              <button
                onClick={() => deleteEvidence(ev.id, complaintId)}
                style={{
                  borderRadius: "6px",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  background: "transparent",
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                Remove
              </button>
            </div>

            {/* OCR Extracted Text Preview */}
            {ev.extracted_text && (
              <div style={{
                marginTop: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.15)",
                background: "rgba(2, 8, 23, 0.6)",
                padding: "12px",
              }}>
                <p style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#64748b",
                  marginBottom: "4px",
                  margin: "0 0 4px",
                }}>
                  OCR Extracted Text
                </p>
                <p style={{
                  fontSize: "0.78rem",
                  color: "#cbd5e1",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  margin: 0,
                  maxHeight: "100px",
                  overflowY: "auto",
                }}>
                  {ev.extracted_text}
                </p>
              </div>
            )}

            {/* Detected Entities */}
            {ev.detected_entities && Object.keys(ev.detected_entities).length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <EntityPanel entities={ev.detected_entities} />
              </div>
            )}
          </div>
        ))}

        {evidence.length === 0 && (
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#64748b", padding: "20px 0" }}>
            No evidence uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
