import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RiskBadge from "../components/RiskBadge";
import useComplaintStore from "../store/complaintStore";
import useStore from "../store/useStore";

export default function Dashboard() {
  const { complaints, fetchComplaints, createComplaint } = useComplaintStore();
  const { setActiveComplaint } = useStore();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints().finally(() => setLoading(false));
  }, []);

  const handleNewCase = async () => {
    setCreating(true);
    try {
      const complaint = await createComplaint("Untitled Incident");
      setActiveComplaint(complaint.id);
      navigate("/chat");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCase = (complaint) => {
    setActiveComplaint(complaint.id);
    navigate("/chat");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020817", color: "#f1f5f9" }}>
      <Navbar />

      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "32px",
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display, sans-serif)",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#f8fafc",
              marginBottom: "4px",
            }}>
              Your cases
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
              Every incident you've described lives here as a case file.
            </p>
          </div>

          <button
            onClick={handleNewCase}
            disabled={creating}
            id="dashboard-new-case-btn"
            style={{
              borderRadius: "8px",
              background: "#f59e0b",
              border: "none",
              padding: "10px 20px",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#020817",
              cursor: creating ? "not-allowed" : "pointer",
              opacity: creating ? 0.6 : 1,
              transition: "background 0.2s",
            }}
          >
            {creating ? "Creating..." : "+ New case"}
          </button>
        </div>

        {/* Content list */}
        <div>
          {loading && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              Loading your cases...
            </div>
          )}

          {!loading && complaints.length === 0 && (
            <div style={{
              borderRadius: "12px",
              border: "1px dashed rgba(59, 130, 246, 0.25)",
              background: "rgba(15, 23, 42, 0.4)",
              padding: "48px 24px",
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: "var(--font-display, sans-serif)",
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "#f8fafc",
                marginBottom: "8px",
              }}>
                No cases yet
              </p>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", maxWidth: "450px", margin: "0 auto 20px" }}>
                Start a new case and describe what happened — CyberSaathi will take it from there.
              </p>
              <button
                onClick={handleNewCase}
                style={{
                  borderRadius: "8px",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  color: "#60a5fa",
                  fontWeight: 600,
                  padding: "8px 18px",
                  cursor: "pointer",
                }}
              >
                + Start your first case
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {complaints.map((c) => (
              <button
                key={c.id}
                onClick={() => handleOpenCase(c)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "12px",
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  background: "rgba(15, 23, 42, 0.55)",
                  backdropFilter: "blur(12px)",
                  padding: "20px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "inherit",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.85)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.15)";
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.55)";
                }}
              >
                <div style={{ minWidth: 0, flex: 1, paddingRight: "16px" }}>
                  <p style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#f8fafc",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {c.title || `Case #${c.id}`}
                  </p>
                  <p style={{
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                    marginTop: "4px",
                    marginBottom: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {c.raw_description || c.incident_description || "No description added yet."}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.72rem",
                    color: "#64748b",
                    margin: 0,
                  }}>
                    Updated {new Date(c.updated_at || c.created_at || Date.now()).toLocaleString("en-IN")}
                  </p>
                </div>

                <div style={{
                  marginLeft: "16px",
                  display: "flex",
                  flexShrink: 0,
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                }}>
                  <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                  {c.crime_category && (
                    <span style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      borderRadius: "6px",
                      padding: "2px 8px",
                    }}>
                      {c.crime_category}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
