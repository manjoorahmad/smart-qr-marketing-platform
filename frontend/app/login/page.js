"use client";

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";

const API_URL = "https://smart-qr-marketing-platform.onrender.com/api";

const QRLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
    <rect x="3" y="16" width="5" height="5" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" />
    <path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  // Already logged in check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) window.location.href = "/";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back!", `Hello ${data.user.name} 👋`);
        window.location.href = "/";
      } else {
        toast.error("Login failed", data.message || "Invalid email or password.");
      }
    } catch (err) {
      toast.error("Connection error", "Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}>
            <QRLogo />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#f1f5f9", marginBottom: "6px" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Log in to your Smart QR Marketing account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              id="login-email"
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#f1f5f9",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 150ms ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                id="login-password"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 150ms ease",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                id="login-toggle-password"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="login-submit-btn"
            style={{
              width: "100%",
              padding: "13px",
              background: loading ? "rgba(99,102,241,0.6)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 150ms ease",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
              id="login-signup-link"
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}