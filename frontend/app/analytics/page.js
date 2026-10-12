"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiCall } from "../lib/api";
import { useToast } from "../context/ToastContext";

// Simple Bar Chart (no external dependency)
function BarChart({ data, color = "#6366f1", label = "Scans" }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "40px 24px" }}>
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-description">No data available for this period.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
          height: "180px",
          minWidth: `${data.length * 40}px`,
          padding: "0 4px",
        }}
      >
        {data.map((item, idx) => {
          const heightPercent = (item.count / maxVal) * 100;
          return (
            <div
              key={idx}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: "1", minWidth: "32px" }}
              title={`${item.label}: ${item.count} ${label}`}
            >
              <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {item.count > 0 ? item.count : ""}
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(heightPercent, 2)}%`,
                  background: `linear-gradient(180deg, ${color}CC, ${color})`,
                  borderRadius: "4px 4px 2px 2px",
                  minHeight: "4px",
                  transition: "height 0.5s ease",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: "9px", color: "var(--text-tertiary)", textAlign: "center", maxWidth: "40px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Horizontal bar for breakdown
function HorizontalBar({ items, colors }) {
  const total = items.reduce((s, x) => s + x.count, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {items.map((item, i) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={i}>
            <div className="flex-between" style={{ marginBottom: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                {item._id || "Unknown"}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: colors[i % colors.length] }}>
                {item.count} ({pct}%)
              </span>
            </div>
            <div style={{ height: "8px", background: "var(--bg-tertiary)", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: colors[i % colors.length],
                  borderRadius: "4px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Skeleton
function AnalyticsSkeleton() {
  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: "24px" }}>
        {[1,2,3,4].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ width: "48px", height: "48px", marginBottom: "16px" }} />
            <div className="skeleton" style={{ width: "100px", height: "12px", marginBottom: "10px" }} />
            <div className="skeleton" style={{ width: "80px", height: "30px" }} />
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom: "24px", padding: "24px" }}>
        <div className="skeleton" style={{ width: "200px", height: "18px", marginBottom: "20px" }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px" }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ flex: 1, height: `${20 + Math.random() * 80}%`, borderRadius: "4px 4px 2px 2px" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatChartData(scansOverTime, period) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return scansOverTime.map((item) => {
    let label = "";
    if (period === "daily") label = `${item._id.day}/${item._id.month}`;
    else if (period === "weekly") label = `W${item._id.week}`;
    else label = months[(item._id.month || 1) - 1];
    return { label, count: item.count };
  });
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scanLimit, setScanLimit] = useState(20);
  const toast = useToast();

  // Login check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.replace("/login");
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ limit: scanLimit });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const data = await apiCall(`/analytics?${params.toString()}`);
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
      toast.error("Analytics error", err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, scanLimit]);

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

  const handlePeriodChange = (p) => {
    setPeriod(p);
    fetchChartData(p);
  };

  const handleApplyFilter = () => {
    fetchAnalytics();
    fetchChartData(period);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      fetchAnalytics();
      fetchChartData(period);
    }, 50);
  };

  const DEVICE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];
  const BROWSER_COLORS = ["#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#f43f5e"];
  const CAMPAIGN_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const formattedChartData = chartData
    ? formatChartData(chartData.scansOverTime, period)
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Loading your analytics data...</p>
        </div>
        <AnalyticsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="page-header flex-between" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track and analyze your QR campaign performance.</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card" style={{ marginBottom: "24px", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>📅 Date Range:</span>
          <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ flex: "1", minWidth: "140px", maxWidth: "200px" }} id="analytics-start-date" />
          <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>to</span>
          <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ flex: "1", minWidth: "140px", maxWidth: "200px" }} id="analytics-end-date" />

          <select
            className="form-select"
            value={scanLimit}
            onChange={(e) => setScanLimit(parseInt(e.target.value))}
            style={{ minWidth: "130px" }}
            id="analytics-scan-limit"
          >
            <option value={10}>Last 10 scans</option>
            <option value={20}>Last 20 scans</option>
            <option value={50}>Last 50 scans</option>
            <option value={100}>Last 100 scans</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={handleApplyFilter} id="analytics-apply-btn">Apply</button>
          {(startDate || endDate) && (
            <button className="btn btn-ghost btn-sm" onClick={handleClearFilter} id="analytics-clear-btn">Clear</button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "24px" }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Stat Cards */}
      {analytics && (
        <div className="stat-grid" style={{ marginBottom: "28px" }}>
          <div className="stat-card" style={{ borderTop: "3px solid #6366f1" }}>
            <div className="stat-card-icon" style={{ background: "var(--color-primary-light)" }}>📁</div>
            <p className="stat-card-label">Total Campaigns</p>
            <h2 className="stat-card-value">{analytics.totalCampaigns}</h2>
          </div>
          <div className="stat-card" style={{ borderTop: "3px solid #10b981" }}>
            <div className="stat-card-icon" style={{ background: "var(--color-success-light)" }}>📊</div>
            <p className="stat-card-label">Total Scans</p>
            <h2 className="stat-card-value">{analytics.totalScans.toLocaleString()}</h2>
          </div>
          <div className="stat-card" style={{ borderTop: "3px solid #f59e0b" }}>
            <div className="stat-card-icon" style={{ background: "var(--color-warning-light)" }}>✅</div>
            <p className="stat-card-label">Active Campaigns</p>
            <h2 className="stat-card-value">{analytics.activeCampaigns}</h2>
          </div>
          <div className="stat-card" style={{ borderTop: "3px solid #ef4444" }}>
            <div className="stat-card-icon" style={{ background: "var(--color-danger-light)" }}>🎯</div>
            <p className="stat-card-label">Avg Scans / Campaign</p>
            <h2 className="stat-card-value">{analytics.avgScansPerCampaign}</h2>
          </div>
        </div>
      )}

      {/* Main Chart - Scans Over Time */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h2 className="card-title">📈 QR Scans Over Time</h2>
          <div style={{ display: "flex", gap: "6px" }}>
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? "btn-primary" : "btn-ghost"}`}
                onClick={() => handlePeriodChange(p)}
                style={{ textTransform: "capitalize" }}
                id={`analytics-period-${p}`}
              >
                {p === "daily" ? "Daily" : p === "weekly" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {chartLoading ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "180px" }}>
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ flex: 1, height: `${20 + Math.random() * 80}%`, borderRadius: "4px 4px 2px 2px" }} />
              ))}
            </div>
          ) : (
            <BarChart data={formattedChartData} color="#6366f1" label="scans" />
          )}
        </div>
      </div>

      {/* Breakdown Charts Row */}
      {chartData && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
          {/* Campaign Comparison */}
          {chartData.campaignBreakdown && chartData.campaignBreakdown.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🏆 Campaign Performance</h2>
              </div>
              <div className="card-body">
                <HorizontalBar items={chartData.campaignBreakdown.map((c) => ({ ...c, _id: c.name || "Unknown" }))} colors={CAMPAIGN_COLORS} />
              </div>
            </div>
          )}

          {/* Device Breakdown */}
          {chartData.deviceBreakdown && chartData.deviceBreakdown.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📱 Device Distribution</h2>
              </div>
              <div className="card-body">
                <HorizontalBar items={chartData.deviceBreakdown} colors={DEVICE_COLORS} />
              </div>
            </div>
          )}

          {/* Browser Breakdown */}
          {chartData.browserBreakdown && chartData.browserBreakdown.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🌐 Browser Distribution</h2>
              </div>
              <div className="card-body">
                <HorizontalBar items={chartData.browserBreakdown} colors={BROWSER_COLORS} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Scans Table */}
      {analytics && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🔍 Recent Scan Activity</h2>
            <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Showing {analytics.recentScans?.length || 0} scans
            </span>
          </div>

          {!analytics.recentScans || analytics.recentScans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h2 className="empty-state-title">No Scans Yet</h2>
              <p className="empty-state-description">
                Share your QR codes to start tracking scan data.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Campaign</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentScans.map((scan, idx) => {
                    const scanDate = new Date(scan.scannedAt);
                    return (
                      <tr key={scan._id}>
                        <td style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>{idx + 1}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {scan.campaign?.name || "Unknown Campaign"}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                            {scan.device === "Mobile" ? "📱" : scan.device === "Tablet" ? "📟" : "💻"}
                            {scan.device || "Unknown"}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                            🌐 {scan.browser || "Unknown"}
                          </span>
                        </td>
                        <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {scanDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {scanDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}