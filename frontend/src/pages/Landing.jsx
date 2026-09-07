import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const STEPS = [
  {
    n: "01",
    title: "Describe what happened",
    body: "Talk to CyberSaathi in plain language. No forms, no jargon — just tell your story the way you'd tell a friend.",
  },
  {
    n: "02",
    title: "Upload evidence",
    body: "Screenshots, SMS, emails, receipts. OCR reads every image and PDF automatically and pulls out the details that matter.",
  },
  {
    n: "03",
    title: "Get classified & scored",
    body: "Machine learning identifies the crime category and a weighted model scores urgency, so nothing critical waits in a queue.",
  },
  {
    n: "04",
    title: "Review your draft",
    body: "A structured, ten-section complaint is generated automatically — evidence checklist and timeline included — ready for your review.",
  },
];

const CATEGORIES = [
  "UPI Fraud", "Banking Fraud", "OTP Scams", "Phishing", "Job Fraud",
  "Investment Fraud", "E-commerce Fraud", "Social Media Fraud", "Account Compromise",
  "Identity Theft", "Impersonation", "Cyber Extortion", "Malware / Ransomware", "Cryptocurrency Fraud",
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020817", color: "#f1f5f9" }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
        padding: "80px 24px 100px",
      }}>
        {/* Glow background */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "5%",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "rgba(245, 158, 11, 0.08)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.08)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "48px",
          alignItems: "center",
          position: "relative",
        }}>
          <div>
            {/* Tag badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "999px",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              background: "rgba(15, 23, 42, 0.8)",
              padding: "6px 14px",
              fontSize: "0.78rem",
              color: "#94a3b8",
              fontFamily: "var(--font-mono, monospace)",
              marginBottom: "24px",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#14b8a6" }} />
              AI-assisted decision support, not a law-enforcement replacement
            </div>

            <h1 style={{
              fontFamily: "var(--font-display, sans-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#f8fafc",
              marginBottom: "20px",
            }}>
              Turn a confusing cybercrime incident into a clear, filed-ready complaint.
            </h1>

            <p style={{
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: "#94a3b8",
              maxWidth: "520px",
              marginBottom: "32px",
            }}>
              CyberSaathi listens to what happened, reads your evidence, classifies the fraud type, scores the
              urgency, and drafts the paperwork — so you can act fast instead of figuring out where to start.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <Link
                to="/auth"
                className="btn btn-primary"
                style={{
                  background: "#f59e0b",
                  borderColor: "#f59e0b",
                  color: "#020817",
                  fontWeight: 700,
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Start your case
              </Link>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  color: "#94a3b8",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Official portal ↗
              </a>
            </div>

            <p style={{
              marginTop: "24px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.8rem",
              color: "#64748b",
            }}>
              In immediate danger or facing active extortion? Call{" "}
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>1930</span> — National Cybercrime Helpline.
            </p>
          </div>

          {/* Mock Case Card */}
          <div style={{ position: "relative" }}>
            <div style={{
              borderRadius: "16px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(20px)",
              padding: "24px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
                paddingBottom: "16px",
              }}>
                <div>
                  <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
                    Case #CS-2026-0417
                  </p>
                  <p style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "1.1rem", fontWeight: 600, color: "#f8fafc", marginTop: "4px" }}>
                    UPI collect-request fraud
                  </p>
                </div>
                <span style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(249, 115, 22, 0.4)",
                  background: "rgba(249, 115, 22, 0.15)",
                  padding: "4px 12px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#fb923c",
                }}>
                  HIGH · 58/100
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px 0", fontSize: "0.88rem" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", color: "#64748b" }}>
                    Category confidence
                  </p>
                  <p style={{ color: "#f8fafc", marginTop: "4px", fontWeight: 500 }}>
                    Logistic Regression · 94.2%
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", color: "#64748b" }}>
                    Financial loss
                  </p>
                  <p style={{ color: "#f8fafc", marginTop: "4px", fontWeight: 700 }}>
                    ₹48,000
                  </p>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(59, 130, 246, 0.15)", paddingTop: "16px" }}>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
                  Detected identifiers
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {["9876543210", "UTR2847...", "fraud@upi", "cybercrime.gov.in"].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        borderRadius: "6px",
                        border: "1px solid rgba(59, 130, 246, 0.15)",
                        background: "rgba(30, 41, 59, 0.7)",
                        padding: "4px 8px",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.75rem",
                        color: "#cbd5e1",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(45, 212, 191, 0.25)",
                background: "rgba(15, 23, 42, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "#64748b" }}>
                    Complaint draft
                  </p>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#2dd4bf", marginTop: "2px" }}>
                    ✓ 10 sections ready
                  </p>
                </div>
                <span style={{
                  borderRadius: "6px",
                  border: "1px solid rgba(45, 212, 191, 0.3)",
                  background: "rgba(45, 212, 191, 0.1)",
                  padding: "4px 10px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                  color: "#2dd4bf",
                  fontWeight: 600,
                }}>
                  PDF Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section style={{
        borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
        background: "rgba(10, 22, 40, 0.4)",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.75rem",
            fontWeight: 600,
            color: "#f8fafc",
            maxWidth: "600px",
          }}>
            Four steps between "this just happened" and a document you can file.
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "32px",
            marginTop: "48px",
          }}>
            {STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  borderTop: "2px solid rgba(245, 158, 11, 0.4)",
                  paddingTop: "20px",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem", color: "#f59e0b", fontWeight: 700 }}>
                  {step.n}
                </span>
                <h3 style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "#f8fafc",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "#94a3b8" }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{
        borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
        padding: "64px 24px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#64748b",
            marginBottom: "16px",
          }}>
            Fraud categories recognized
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map((c) => (
              <span
                key={c}
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  background: "rgba(15, 23, 42, 0.6)",
                  padding: "6px 14px",
                  fontSize: "0.85rem",
                  color: "#cbd5e1",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer footer */}
      <footer style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
      }}>
        <p style={{
          maxWidth: "700px",
          fontSize: "0.78rem",
          lineHeight: 1.6,
          color: "#64748b",
        }}>
          CyberSaathi is an AI-assisted decision-support tool for complaint preparation. It does not replace law
          enforcement authorities, make legal determinations, or automatically file official complaints. All
          information must be reviewed and confirmed by you before submission to any official authority.
        </p>
      </footer>
    </div>
  );
}
