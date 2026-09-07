import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useStore();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      let msg = "Invalid email or password. Please try again.";
      if (!err.response) {
        msg = "Unable to connect to the backend server. Please verify the backend service is running and accessible.";
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ") : JSON.stringify(detail);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#020817",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <Link to="/" style={{
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
        }}>
          <span style={{
            display: "flex",
            height: "36px",
            width: "36px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            background: "rgba(245, 158, 11, 0.1)",
            color: "#fbbf24",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z" />
            </svg>
          </span>
          <span style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#f8fafc",
          }}>
            CyberSaathi
          </span>
        </Link>

        <h1 style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontSize: "1.6rem",
          fontWeight: 600,
          color: "#f8fafc",
          marginBottom: "6px",
        }}>
          Sign in to your account
        </h1>
        <p style={{
          fontSize: "0.88rem",
          color: "#94a3b8",
          marginBottom: "32px",
        }}>
          Continue working on your case.
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#cbd5e1",
              marginBottom: "6px",
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                background: "rgba(15, 23, 42, 0.85)",
                padding: "10px 14px",
                fontSize: "0.9rem",
                color: "#f8fafc",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#cbd5e1",
              marginBottom: "6px",
            }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                background: "rgba(15, 23, 42, 0.85)",
                padding: "10px 14px",
                fontSize: "0.9rem",
                color: "#f8fafc",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{
              fontSize: "0.85rem",
              color: "#f87171",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              padding: "8px 12px",
              borderRadius: "6px",
              margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              borderRadius: "8px",
              background: "#f59e0b",
              border: "none",
              padding: "12px",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#020817",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "8px",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "#94a3b8",
        }}>
          New here?{" "}
          <Link to="/register" style={{ color: "#fbbf24", fontWeight: 600, textDecoration: "none" }}>
            Create an account
          </Link>
        </p>

        <div style={{
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(59, 130, 246, 0.15)",
          textAlign: "center",
          fontSize: "0.78rem",
          color: "#64748b",
        }}>
          National Cybercrime Helpline: <span style={{ color: "#fbbf24", fontWeight: 700 }}>1930</span>
        </div>
      </div>
    </div>
  );
}
