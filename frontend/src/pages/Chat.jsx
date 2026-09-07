import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import RiskBadge from "../components/RiskBadge";
import useComplaintStore from "../store/complaintStore";
import useStore from "../store/useStore";

export default function Chat() {
  const outlet = useOutletContext();
  const store = useStore();
  const complaintId = outlet?.complaintId || store.activeComplaintId;
  const { messages, activeComplaint, startChat, fetchMessages, sendMessage } = useComplaintStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!complaintId) {
      startChat();
      return;
    }
    (async () => {
      const existing = await fetchMessages(complaintId);
      if (!existing || !existing.length) {
        await startChat(complaintId);
      }
    })();
  }, [complaintId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setSending(true);
    try {
      await sendMessage(complaintId, text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 120px)",
      flexDirection: "column",
      minHeight: "500px",
    }}>
      {/* Header */}
      <div style={{
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "#f8fafc",
            margin: 0,
          }}>
            Describe the incident
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "2px", margin: 0 }}>
            Talk it through — CyberSaathi analyzes as you go.
          </p>
        </div>

        {activeComplaint?.crime_category && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              color: "#60a5fa",
              padding: "4px 10px",
              borderRadius: "6px",
            }}>
              {activeComplaint.crime_category}
            </span>
            <RiskBadge level={activeComplaint.risk_level} score={activeComplaint.risk_score} size="sm" />
          </div>
        )}
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        borderRadius: "12px",
        border: "1px solid rgba(59, 130, 246, 0.18)",
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(12px)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        {messages.map((m, i) => (
          <div
            key={m.id || i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "78%",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                backgroundColor: m.role === "user" ? "#f59e0b" : "rgba(30, 41, 59, 0.75)",
                color: m.role === "user" ? "#020817" : "#f1f5f9",
                border: m.role === "user" ? "none" : "1px solid rgba(59, 130, 246, 0.18)",
                fontWeight: m.role === "user" ? 600 : 400,
                whiteSpace: "pre-wrap",
                boxShadow: m.role === "user" ? "0 4px 12px rgba(245, 158, 11, 0.2)" : "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              background: "rgba(30, 41, 59, 0.6)",
              padding: "10px 16px",
              fontSize: "0.85rem",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              CyberSaathi is analyzing & typing...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type what happened, in your own words..."
          id="chat-message-input"
          style={{
            flex: 1,
            borderRadius: "8px",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            background: "rgba(15, 23, 42, 0.9)",
            padding: "12px 16px",
            fontSize: "0.9rem",
            color: "#f8fafc",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          id="chat-send-btn"
          style={{
            borderRadius: "8px",
            background: "#f59e0b",
            border: "none",
            padding: "12px 24px",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#020817",
            cursor: sending || !input.trim() ? "not-allowed" : "pointer",
            opacity: sending || !input.trim() ? 0.5 : 1,
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          Send
        </button>
      </form>

      <p style={{
        marginTop: "8px",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "0.72rem",
        color: "#64748b",
        margin: "8px 0 0",
      }}>
        🛡️ Never share OTPs, PINs, or passwords here or with anyone claiming to help you.
      </p>
    </div>
  );
}
