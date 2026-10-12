"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

// Page title mapping
const PAGE_TITLES = {
  "/": "Dashboard",
  "/campaigns": "Campaigns",
  "/analytics": "Analytics",
  "/profile": "Profile",
};

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// DashboardLayout - Dashboard pages ke liye wrapper
export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    // User info get karna
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    // Sidebar collapsed state
    const savedCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
    setCollapsed(savedCollapsed);
  }, []);

  const handleCollapse = (val) => {
    setCollapsed(val);
    localStorage.setItem("sidebar-collapsed", String(val));
  };

  const pageTitle = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={handleCollapse}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <main className={`dashboard-main ${collapsed ? "sidebar-collapsed" : ""}`}>

        {/* Top Navigation Bar */}
        <header className="dashboard-topnav">
          {/* Mobile menu toggle */}
          <button
            className="btn-icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{
              display: "none",
              marginRight: "12px",
            }}
            id="mobile-menu-btn"
          >
            <MenuIcon />
          </button>

          {/* Desktop collapse button */}
          <button
            className="btn-icon"
            onClick={() => handleCollapse(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ marginRight: "12px" }}
            id="desktop-collapse-btn"
          >
            <MenuIcon />
          </button>

          {/* Page title */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}>
              {pageTitle}
            </h1>
          </div>

          {/* Right side - Notifications + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Notification bell */}
            <button className="btn-icon" aria-label="Notifications" title="Notifications">
              <BellIcon />
            </button>

            {/* Profile avatar */}
            {user && (
              <a
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-primary)",
                  cursor: "pointer",
                  transition: "background-color var(--transition-fast)",
                }}
                title="View Profile"
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  id="topnav-username"
                >
                  {user.name}
                </span>
              </a>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          #mobile-menu-btn { display: flex !important; }
          #desktop-collapse-btn { display: none !important; }
        }
        @media (min-width: 1025px) {
          #mobile-menu-btn { display: none !important; }
          #desktop-collapse-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
