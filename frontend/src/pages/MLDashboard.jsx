import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import EntityPanel from "../components/EntityPanel";
import ModelComparisonChart from "../components/ModelComparisonChart";
import RiskBadge from "../components/RiskBadge";
import client from "../api/client";

export default function MLDashboard() {
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");
  const [testText, setTestText] = useState("");
  const [result, setResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    client
      .get("/ml/comparison")
      .then(({ data }) => setComparison(data))
      .catch((err) => setError(err.response?.data?.detail || "Model comparison data not available."));
  }, []);

  const handleTest = async (e) => {
    e.preventDefault();
    if (!testText.trim()) return;
    setTesting(true);
    setResult(null);
    try {
      const { data } = await client.post("/ml/classify", { text: testText });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Classification failed.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020817", color: "#f1f5f9" }}>
      <Navbar />
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "#f8fafc",
          marginBottom: "4px",
        }}>
          Model insights
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "32px" }}>
          How the four classifiers compare, and a sandbox to test classification on any text.
        </p>

        {error && !comparison && (
          <p style={{
            borderRadius: "8px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "rgba(239, 68, 68, 0.1)",
            padding: "16px",
            fontSize: "0.85rem",
            color: "#f87171",
          }}>
            {error}
          </p>
        )}

        {comparison && (
          <>
            {/* Chart Card */}
            <div style={{
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              padding: "24px",
              marginBottom: "24px",
            }}>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
                paddingBottom: "16px",
                marginBottom: "16px",
              }}>
                <p style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#64748b",
                  margin: 0,
                }}>
                  Accuracy / Precision / Recall / F1
                </p>
                <span style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(20, 184, 166, 0.4)",
                  background: "rgba(20, 184, 166, 0.1)",
                  padding: "4px 12px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                  color: "#2dd4bf",
                  fontWeight: 600,
                }}>
                  Best: {comparison.best_model}
                </span>
              </div>

              <ModelComparisonChart metrics={comparison.metrics} />
            </div>

            {/* Metrics Table */}
            <div style={{
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              background: "rgba(15, 23, 42, 0.6)",
              overflow: "hidden",
            }}>
              <table style={{ width: "100%", textAlign: "left", fontSize: "0.88rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(30, 41, 59, 0.6)", color: "#64748b" }}>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", textTransform: "uppercase" }}>Model</th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", textTransform: "uppercase" }}>Accuracy</th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", textTransform: "uppercase" }}>Precision</th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", textTransform: "uppercase" }}>Recall</th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", textTransform: "uppercase" }}>F1</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.metrics.map((m) => (
                    <tr key={m.model_name} style={{ borderTop: "1px solid rgba(59, 130, 246, 0.12)", color: "#f8fafc" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{m.model_name}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", color: "#60a5fa" }}>{(m.accuracy * 100).toFixed(1)}%</td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", color: "#2dd4bf" }}>{(m.precision * 100).toFixed(1)}%</td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", color: "#fbbf24" }}>{(m.recall * 100).toFixed(1)}%</td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)", color: "#a78bfa" }}>{(m.f1_score * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{
              marginTop: "12px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              color: "#64748b",
            }}>
              {comparison.categories?.length || 15} categories · trained{" "}
              {comparison.trained_at ? new Date(comparison.trained_at).toLocaleString() : "—"}
            </p>
          </>
        )}

        {/* Live sandbox */}
        <div style={{ marginTop: "48px" }}>
          <h2 style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#f8fafc",
            marginBottom: "4px",
          }}>
            Try the classifier
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "16px" }}>
            Paste any incident description to see live classification and entity extraction.
          </p>

          <form onSubmit={handleTest}>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={4}
              placeholder="e.g. I received a call claiming to be from my bank asking for my OTP and 15,000 INR was deducted..."
              id="ml-test-textarea"
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                background: "rgba(15, 23, 42, 0.85)",
                padding: "12px 16px",
                fontSize: "0.9rem",
                color: "#f8fafc",
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            <button
              type="submit"
              disabled={testing || !testText.trim()}
              id="ml-classify-btn"
              style={{
                marginTop: "12px",
                borderRadius: "8px",
                background: "#f59e0b",
                border: "none",
                padding: "10px 24px",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#020817",
                cursor: testing || !testText.trim() ? "not-allowed" : "pointer",
                opacity: testing || !testText.trim() ? 0.5 : 1,
                transition: "background 0.2s",
              }}
            >
              {testing ? "Classifying..." : "Classify"}
            </button>
          </form>

          {result && (
            <div style={{
              marginTop: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              background: "rgba(15, 23, 42, 0.6)",
              padding: "20px",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                <span style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  background: "rgba(59, 130, 246, 0.12)",
                  padding: "6px 14px",
                  fontSize: "0.85rem",
                  color: "#60a5fa",
                  fontWeight: 600,
                }}>
                  {result.category} · {(result.confidence * 100).toFixed(1)}%
                </span>
                <RiskBadge level={result.risk_level} score={result.risk_score} size="sm" />
              </div>

              {result.missing_fields && result.missing_fields.length > 0 && (
                <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "#94a3b8" }}>
                  <strong style={{ color: "#f8fafc" }}>Missing information:</strong> {result.missing_fields.join(", ")}
                </p>
              )}

              <div style={{ marginTop: "16px" }}>
                <EntityPanel entities={result.entities} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
