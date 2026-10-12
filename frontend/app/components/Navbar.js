"use client";

// Navbar component
// Ye dashboard ke sabhi main pages par navigation provide karega
export default function Navbar() {

  // =========================
  // LOGOUT FUNCTION
  // =========================

  const handleLogout = () => {

    // Browser se JWT token remove kar rahe hain
    localStorage.removeItem("token");

    // User information bhi remove kar rahe hain
    localStorage.removeItem("user");

    // Login page par redirect
    window.location.href = "/login";
  };


  return (
    <nav className="dashboard-topnav" style={{ position: "static", justifyContent: "space-between" }}>
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
          Smart QR Marketing
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <a href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          Dashboard
        </a>
        <a href="/campaigns" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          Campaigns
        </a>
        <a href="/analytics" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          Analytics
        </a>
        <a href="/profile" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          Profile
        </a>
      </div>

      <button
        onClick={handleLogout}
        className="btn btn-secondary btn-sm"
      >
        Logout
      </button>
    </nav>
  );
}