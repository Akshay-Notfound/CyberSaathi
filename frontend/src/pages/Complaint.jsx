import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ChecklistPanel from "../components/ChecklistPanel";
import EntityPanel from "../components/EntityPanel";
import RiskBadge from "../components/RiskBadge";
import TimelinePanel from "../components/TimelinePanel";
import client from "../api/client";
import useComplaintStore from "../store/complaintStore";
import useStore from "../store/useStore";

const TABS = ["Draft", "Evidence checklist", "Timeline", "Identifiers"];

export default function ComplaintDraft() {
  const outlet = useOutletContext();
  const store = useStore();
  const complaintId = outlet?.complaintId || store.activeComplaintId;
  const { activeComplaint, fetchComplaint, reanalyze, updateComplaint } = useComplaintStore();
  const [tab, setTab] = useState("Draft");
  const [downloading, setDownloading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({ title: "", incident_date: "", financial_loss: "" });

  useEffect(() => {
    if (complaintId) {
      fetchComplaint(complaintId);
    }
  }, [complaintId]);

  useEffect(() => {
    if (activeComplaint) {
      setFields({
        title: activeComplaint.title || "",
        incident_date: activeComplaint.incident_date || "",
        financial_loss: activeComplaint.financial_loss !== null && activeComplaint.financial_loss !== undefined ? activeComplaint.financial_loss : "",
      });
    }
  }, [activeComplaint?.id, activeComplaint?.title, activeComplaint?.financial_loss, activeComplaint?.incident_date]);

  const handleReanalyze = async () => {
    if (!complaintId) return;
    setReanalyzing(true);
    try {
      await reanalyze(complaintId);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!complaintId) return;
    await updateComplaint(complaintId, {
      title: fields.title,
      incident_date: fields.incident_date || null,
      financial_loss: fields.financial_loss ? parseFloat(fields.financial_loss) : null,
    });
    setEditing(false);
  };

  const handleDownloadPdf = async () => {
    if (!complaintId) return;
    setDownloading(true);
    try {
      // Ensure complaint is generated first if not already
      try {
        await client.post('/complaints/generate', { complaint_id: complaintId });
      } catch (e) {}

      const response = await client.get(`/complaints/${complaintId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `CyberSaathi_Complaint_${(activeComplaint?.title || "case").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF. Please describe the incident first so a draft can be generated.");
    } finally {
      setDownloading(false);
    }
  };

  if (!activeComplaint) {
    return <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Loading case...</p>;
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header & Actions */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.35rem",
            fontWeight: 600,
            color: "#f8fafc",
            margin: 0,
          }}>
            Complaint draft
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0" }}>
            Review and edit before you file or download.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            id="complaint-reanalyze-btn"
            style={{
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              background: "rgba(15, 23, 42, 0.8)",
              padding: "8px 16px",
              fontSize: "0.85rem",
              color: "#cbd5e1",
              cursor: reanalyzing ? "not-allowed" : "pointer",
              opacity: reanalyzing ? 0.6 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {reanalyzing ? "Re-analyzing..." : "Re-run analysis"}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            id="complaint-download-pdf-btn"
            style={{
              borderRadius: "8px",
              background: "#f59e0b",
              border: "none",
              padding: "8px 18px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#020817",
              cursor: downloading ? "not-allowed" : "pointer",
              opacity: downloading ? 0.6 : 1,
              transition: "background 0.2s",
            }}
          >
            {downloading ? "Preparing..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Key facts card */}
      <div style={{
        marginTop: "24px",
        borderRadius: "12px",
        border: "1px solid rgba(59, 130, 246, 0.18)",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(12px)",
        padding: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#64748b",
            margin: 0,
          }}>
            Key facts
          </p>
          <button
            onClick={() => setEditing((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "#fbbf24",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <div style={{
            marginTop: "16px",
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}>
            <input
              value={fields.title}
              onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
              placeholder="Case title"
              style={{
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                background: "rgba(2, 8, 23, 0.8)",
                padding: "8px 12px",
                fontSize: "0.85rem",
                color: "#f8fafc",
                outline: "none",
              }}
            />
            <input
              value={fields.incident_date}
              onChange={(e) => setFields((f) => ({ ...f, incident_date: e.target.value }))}
              placeholder="Incident date (e.g. 2026-08-30)"
              style={{
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                background: "rgba(2, 8, 23, 0.8)",
                padding: "8px 12px",
                fontSize: "0.85rem",
                color: "#f8fafc",
                outline: "none",
              }}
            />
            <input
              value={fields.financial_loss}
              onChange={(e) => setFields((f) => ({ ...f, financial_loss: e.target.value }))}
              placeholder="Financial loss (₹)"
              type="number"
              style={{
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                background: "rgba(2, 8, 23, 0.8)",
                padding: "8px 12px",
                fontSize: "0.85rem",
                color: "#f8fafc",
                outline: "none",
              }}
            />
            <button
              onClick={handleSaveDetails}
              style={{
                borderRadius: "8px",
                background: "#14b8a6",
                border: "none",
                color: "#020817",
                fontWeight: 700,
                padding: "10px",
                fontSize: "0.85rem",
                cursor: "pointer",
                gridColumn: "1 / -1",
              }}
            >
              Save & re-analyze
            </button>
          </div>
        ) : (
          <div style={{
            marginTop: "14px",
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}>
            <div>
              <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 2px" }}>Category</p>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f8fafc", margin: 0 }}>
                {activeComplaint.crime_category || "Pending"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 2px" }}>Risk</p>
              <div style={{ marginTop: "2px" }}>
                <RiskBadge level={activeComplaint.risk_level} score={activeComplaint.risk_score} size="sm" />
              </div>
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 2px" }}>Incident date</p>
              <p style={{ fontSize: "0.9rem", color: "#f8fafc", margin: 0 }}>
                {activeComplaint.incident_date || "Not set"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 2px" }}>Financial loss</p>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                {activeComplaint.financial_loss ? `₹${Number(activeComplaint.financial_loss).toLocaleString("en-IN")}` : "Not set"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        marginTop: "28px",
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid rgba(59, 130, 246, 0.18)",
      }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            id={`complaint-tab-${t.toLowerCase().replace(/\s+/g, '-')}`}
            style={{
              padding: "10px 16px",
              fontSize: "0.85rem",
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? "#f8fafc" : "#64748b",
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid #f59e0b" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div style={{ marginTop: "20px" }}>
        {tab === "Draft" && (
          <pre style={{
            whiteSpace: "pre-wrap",
            borderRadius: "12px",
            border: "1px solid rgba(59, 130, 246, 0.18)",
            background: "rgba(2, 8, 23, 0.7)",
            padding: "20px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.78rem",
            lineHeight: 1.65,
            color: "#cbd5e1",
            maxHeight: "650px",
            overflowY: "auto",
          }}>
            {activeComplaint.generated_complaint || "Draft will appear once you describe the incident in chat or click 'Re-run analysis'."}
          </pre>
        )}
        {tab === "Evidence checklist" && <ChecklistPanel items={activeComplaint.checklist} />}
        {tab === "Timeline" && <TimelinePanel events={activeComplaint.timeline} />}
        {tab === "Identifiers" && <EntityPanel entities={activeComplaint.extracted_entities} />}
      </div>
    </div>
  );
}
