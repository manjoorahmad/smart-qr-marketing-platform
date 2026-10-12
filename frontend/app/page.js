"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { apiCall } from "./lib/api";
import { useToast } from "./context/ToastContext";

// Simple Bar Chart Component (no external library)
function SimpleBarChart({ data, label = "Scans" }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "40px 24px" }}>
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-description">No scan data available for this period.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ padding: "16px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "6px",
          height: "160px",
          padding: "0 4px",
          overflowX: "auto",
        }}
      >
        {data.map((item, idx) => {
          const heightPercent = (item.count / maxVal) * 100;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                flex: "1",
                minWidth: "28px",
                maxWidth: "48px",
              }}
              title={`${item.label}: ${item.count} ${label}`}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {item.count > 0 ? item.count : ""}
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(heightPercent, 2)}%`,
                  background:
                    idx === data.length - 1
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "linear-gradient(135deg, rgba(99,102,241,0.6), rgba(139,92,246,0.5))",
                  borderRadius: "4px 4px 2px 2px",
                  transition: "height 0.4s ease",
                  minHeight: "4px",
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: "var(--text-tertiary)",
                  textAlign: "center",
                  maxWidth: "40px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Skeleton loader components
function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: "48px", height: "48px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ width: "80px", height: "12px", marginBottom: "12px" }} />
      <div className="skeleton" style={{ width: "100px", height: "32px", marginBottom: "8px" }} />
      <div className="skeleton" style={{ width: "60px", height: "10px" }} />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              flex: 1,
              height: `${20 + Math.random() * 80}%`,
              borderRadius: "4px 4px 2px 2px",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Format chart data for display
function formatChartData(scansOverTime, period) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return scansOverTime.map((item) => {
    let label = "";
    if (period === "daily") {
      label = `${item._id.day}/${item._id.month}`;
    } else if (period === "weekly") {
      label = `W${item._id.week}`;
    } else {
      label = months[(item._id.month || 1) - 1];
    }
    return { label, count: item.count };
  });
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [user, setUser] = useState(null);
  const toast = useToast();

  // Login check & get user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/analytics";
      const params = new URLSearchParams({ limit: 10 });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      url = `/analytics?${params.toString()}`;

      const data = await apiCall(url);
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
      toast.error("Failed to load analytics", err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Fetch chart data
  const fetchChartData = useCallback(async (selectedPeriod = period) => {
    try {
      setChartLoading(true);
      const params = new URLSearchParams({ period: selectedPeriod });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const data = await apiCall(`/analytics/chart?${params.toString()}`);
      setChartData(data.chartData);
    } catch (err) {
      console.error("Chart data error:", err);
    } finally {
      setChartLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
    fetchChartData(period);
  }, []);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchChartData(newPeriod);
  };

  const handleDateFilter = () => {
    fetchAnalytics();
    fetchChartData(period);
  };

  const handlePreset = (days) => {
    if (days === 0) {
      setStartDate("");
      setEndDate("");
      setTimeout(() => {
        fetchAnalytics();
        fetchChartData(period);
      }, 50);
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      fetchAnalytics();
      fetchChartData(period);
    }, 100);
  };

  // Format chart data
  const formattedChartData = chartData
    ? formatChartData(chartData.scansOverTime, period)
    : [];

  return (
    <DashboardLayout>
      {/* 1. Dashboard Header */}
      <div className="page-header flex-between" style={{ flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "24px", fontWeight: 800 }}>
            Dashboard
          </h1>
          <p className="page-subtitle" style={{ fontSize: "14px", marginTop: "4px" }}>
            Welcome back, <strong style={{ color: "var(--text-primary)" }}>{user?.name || "Marketer"}</strong>! Here's an overview of your QR marketing campaigns.
          </p>
        </div>
        <a href="/campaigns" className="btn btn-primary" id="dashboard-create-campaign-btn">
          <span>+</span> New Campaign
        </a>
      </div>

      {/* 2. Date-Range Filter Toolbar */}
      <div
        className="card"
        style={{ marginBottom: "24px", padding: "14px 20px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          {/* Inputs & Quick buttons */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", flex: 1 }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
              📅 Filter Dates:
            </span>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: "145px", padding: "6px 10px", fontSize: "13px" }}
              id="dashboard-start-date"
              title="Start date"
            />
            <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>to</span>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: "145px", padding: "6px 10px", fontSize: "13px" }}
              id="dashboard-end-date"
              title="End date"
            />
            <button className="btn btn-primary btn-sm" onClick={handleDateFilter} id="dashboard-apply-filter-btn">
              Apply
            </button>
            {(startDate || endDate) && (
              <button className="btn btn-ghost btn-sm" onClick={clearDateFilter} id="dashboard-clear-filter-btn">
                Clear
              </button>
            )}
          </div>

          {/* Presets */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "11px", padding: "5px 10px" }}
              onClick={() => handlePreset(7)}
            >
              7 Days
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "11px", padding: "5px 10px" }}
              onClick={() => handlePreset(30)}
            >
              30 Days
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "11px", padding: "5px 10px" }}
              onClick={() => handlePreset(0)}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "24px" }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* 3. Statistics Cards (4 in one row on desktop, 2 on tablet, 1 on mobile) */}
      <div className="stat-grid" style={{ marginBottom: "28px" }}>
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : analytics ? (
          <>
            {/* Total Campaigns */}
            <div
              className="stat-card"
              style={{ borderTop: "3px solid #6366f1" }}
              id="stat-total-campaigns"
            >
              <div
                className="stat-card-icon"
                style={{ background: "var(--color-primary-light)" }}
              >
                📁
              </div>
              <p className="stat-card-label">Total Campaigns</p>
              <h2 className="stat-card-value">{analytics.totalCampaigns}</h2>
              <p className="stat-card-sub">All created campaigns</p>
            </div>

            {/* Total Scans */}
            <div
              className="stat-card"
              style={{ borderTop: "3px solid #10b981" }}
              id="stat-total-scans"
            >
              <div
                className="stat-card-icon"
                style={{ background: "var(--color-success-light)" }}
              >
                📊
              </div>
              <p className="stat-card-label">Total QR Scans</p>
              <h2 className="stat-card-value">
                {analytics.totalScans.toLocaleString()}
              </h2>
              <p className="stat-card-sub">Lifetime scan count</p>
            </div>

            {/* Active Campaigns */}
            <div
              className="stat-card"
              style={{ borderTop: "3px solid #f59e0b" }}
              id="stat-active-campaigns"
            >
              <div
                className="stat-card-icon"
                style={{ background: "var(--color-warning-light)" }}
              >
                ✅
              </div>
              <p className="stat-card-label">Active Campaigns</p>
              <h2 className="stat-card-value">{analytics.activeCampaigns}</h2>
              <p className="stat-card-sub">
                {analytics.totalCampaigns - analytics.activeCampaigns} inactive
              </p>
            </div>

            {/* Avg Scans per Campaign */}
            <div
              className="stat-card"
              style={{ borderTop: "3px solid #ef4444" }}
              id="stat-avg-scans"
            >
              <div
                className="stat-card-icon"
                style={{ background: "var(--color-danger-light)" }}
              >
                🎯
              </div>
              <p className="stat-card-label">Avg Scans / Campaign</p>
              <h2 className="stat-card-value">
                {analytics.avgScansPerCampaign}
              </h2>
              <p className="stat-card-sub">Average scans per campaign</p>
            </div>
          </>
        ) : null}
      </div>

      {/* 4. Charts Section: 2-Column Desktop Layout (Chart on left 2/3, Top Campaigns on right 1/3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: chartData?.campaignBreakdown?.length > 0 ? "minmax(0, 2fr) minmax(0, 1.2fr)" : "1fr",
          gap: "24px",
          marginBottom: "28px",
        }}
        className="dashboard-charts-grid"
      >
        {/* Scans Over Time Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📈 QR Scans Over Time</h2>
            <div style={{ display: "flex", gap: "6px" }}>
              {["daily", "weekly", "monthly"].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`btn btn-sm ${period === p ? "btn-primary" : "btn-ghost"}`}
                  style={{ textTransform: "capitalize", padding: "5px 12px", fontSize: "12px" }}
                  id={`chart-period-${p}`}
                >
                  {p === "daily" ? "Daily" : p === "weekly" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            {chartLoading ? (
              <ChartSkeleton />
            ) : (
              <SimpleBarChart data={formattedChartData} label="scans" />
            )}
          </div>
        </div>

        {/* Top Campaigns Breakdown */}
        {chartData && chartData.campaignBreakdown && chartData.campaignBreakdown.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🏆 Top Campaigns</h2>
              <a href="/campaigns" style={{ fontSize: "12px", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
                View All
              </a>
            </div>
            <div className="card-body" style={{ padding: "0" }}>
              {chartData.campaignBreakdown.slice(0, 5).map((c, idx) => {
                const maxScans = chartData.campaignBreakdown[0]?.count || 1;
                const percent = Math.round((c.count / maxScans) * 100);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "14px 20px",
                      borderBottom: idx < Math.min(chartData.campaignBreakdown.length, 5) - 1 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <div className="flex-between" style={{ marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                        {c.name || "Unknown Campaign"}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-primary)" }}>
                        {c.count} scans
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        backgroundColor: "var(--bg-tertiary)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${percent}%`,
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          borderRadius: "3px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Recent Scan Activity Table (Full-width below charts) */}
      <div className="card" style={{ marginBottom: "28px" }}>
        <div className="card-header">
          <h2 className="card-title">🔍 Recent QR Scan Activity</h2>
          <a
            href="/analytics"
            style={{ fontSize: "13px", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}
          >
            Full Analytics Table →
          </a>
        </div>
        {loading ? (
          <div className="card-body">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "6px" }} />
                <div className="skeleton" style={{ height: "11px", width: "50%" }} />
              </div>
            ))}
          </div>
        ) : analytics?.recentScans && analytics.recentScans.length > 0 ? (
          <div className="table-container" style={{ border: "none", borderRadius: "0" }}>
            <table>
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Scan Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentScans.slice(0, 8).map((scan) => (
                  <tr key={scan._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>📱</span>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {scan.campaign?.name || "Direct QR Scan"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                        {scan.device === "Mobile" ? "📱 Mobile" : scan.device === "Tablet" ? "📱 Tablet" : "💻 Desktop"}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {scan.browser || "Unknown Browser"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {new Date(scan.scannedAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-active" style={{ fontSize: "11px" }}>
                        ● Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No Scans Recorded Yet</p>
            <p className="empty-state-description">
              Create a campaign, download your QR code, and scan it to see real-time activity here.
            </p>
          </div>
        )}
      </div>

      {/* 6. Device & Browser breakdown */}
      {chartData && (chartData.deviceBreakdown?.length > 0 || chartData.browserBreakdown?.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Device Breakdown */}
          {chartData.deviceBreakdown && chartData.deviceBreakdown.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📱 Scans by Device</h2>
              </div>
              <div className="card-body">
                {chartData.deviceBreakdown.map((d, i) => {
                  const total = chartData.deviceBreakdown.reduce((sum, item) => sum + item.count, 0) || 1;
                  const pct = Math.round((d.count / total) * 100);
                  return (
                    <div key={i} style={{ marginBottom: "14px" }}>
                      <div className="flex-between" style={{ marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>
                          {d._id === "Mobile" ? "📱 Mobile" : d._id === "Tablet" ? "📱 Tablet" : "💻 Desktop"}
                        </span>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {d.count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: "6px", background: "var(--bg-tertiary)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-primary)", borderRadius: "3px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Browser Breakdown */}
          {chartData.browserBreakdown && chartData.browserBreakdown.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🌐 Scans by Browser</h2>
              </div>
              <div className="card-body">
                {chartData.browserBreakdown.map((b, i) => {
                  const total = chartData.browserBreakdown.reduce((sum, item) => sum + item.count, 0) || 1;
                  const pct = Math.round((b.count / total) * 100);
                  return (
                    <div key={i} style={{ marginBottom: "14px" }}>
                      <div className="flex-between" style={{ marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>
                          🌐 {b._id || "Other"}
                        </span>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {b.count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: "6px", background: "var(--bg-tertiary)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-accent)", borderRadius: "3px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Responsive layout CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .dashboard-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}