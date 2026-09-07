import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useStore();
  const navigate = useNavigate();

  const onChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await register(form);
      if (res.ok) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please check your information and try again.");
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
      padding: "32px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* Brand Link */}
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
          Create your account
        </h1>
        <p style={{
          fontSize: "0.88rem",
          color: "#94a3b8",
          marginBottom: "32px",
        }}>
          Your case data stays private to your account.
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
              Full name
            </label>
            <input
              required
              value={form.full_name}
              onChange={onChange("full_name")}
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
              placeholder="Asha Verma"
              id="register-fullname"
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
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={onChange("email")}
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
              id="register-email"
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
              Phone (optional)
            </label>
            <input
              value={form.phone}
              onChange={onChange("phone")}
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
              placeholder="98765 43210"
              id="register-phone"
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
              minLength={6}
              value={form.password}
              onChange={onChange("password")}
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
              placeholder="At least 6 characters"
              id="register-password"
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
            id="register-submit-btn"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "#94a3b8",
        }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#fbbf24", fontWeight: 600, textDecoration: "none" }}>
            Sign in
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
