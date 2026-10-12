"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiCall } from "../lib/api";

// Profile page wrapped in DashboardLayout
export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/users/profile");
      setUser(data.user);
    } catch (err) {
      console.error("Profile Error:", err);
      setError(err.message || "Could not load user profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Profile & Account Settings</h1>
        <p className="page-subtitle">
          Manage your personal information and marketing platform account.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "20px" }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ maxWidth: "680px", padding: "28px" }}>
          <div className="skeleton" style={{ width: "64px", height: "64px", borderRadius: "50%", marginBottom: "20px" }} />
          <div className="skeleton" style={{ width: "40%", height: "20px", marginBottom: "12px" }} />
          <div className="skeleton" style={{ width: "60%", height: "16px", marginBottom: "24px" }} />
          <div className="skeleton" style={{ width: "100%", height: "40px", marginBottom: "12px" }} />
          <div className="skeleton" style={{ width: "100%", height: "40px" }} />
        </div>
      ) : user ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", maxWidth: "900px" }}>
          {/* Personal Info Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">👤 Personal Information</h2>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    fontWeight: 700,
                    boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {user.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {user.email}
                  </p>
                  <span className="badge badge-active" style={{ marginTop: "6px" }}>
                    ● Active User
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "12px 16px", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                    FULL NAME
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {user.name}
                  </p>
                </div>

                <div style={{ padding: "12px 16px", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                    EMAIL ADDRESS
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {user.email}
                  </p>
                </div>

                <div style={{ padding: "12px 16px", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                    ACCOUNT ID
                  </p>
                  <p style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-secondary)", marginTop: "4px", wordBreak: "break-all" }}>
                    {user._id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Security */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🔒 Account Status</h2>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "var(--color-primary-light)" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-primary)", marginBottom: "4px" }}>
                    ⚡ Pro Marketing Tier
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Unlimited campaigns, high-res QR downloads, and full scan analytics tracking are enabled.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <a href="/campaigns" className="btn btn-primary" style={{ flex: 1 }}>
                    View Campaigns
                  </a>
                  <a href="/analytics" className="btn btn-secondary" style={{ flex: 1 }}>
                    View Analytics
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}