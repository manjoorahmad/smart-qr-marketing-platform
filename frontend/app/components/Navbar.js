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
    <nav className="flex items-center justify-between bg-white px-8 py-4 shadow">

      {/* =========================
          LOGO / PROJECT NAME
          ========================= */}

      <div>

        <h1 className="text-xl font-bold text-gray-900">
          Smart QR Marketing
        </h1>

      </div>


      {/* =========================
          NAVIGATION LINKS
          ========================= */}

      <div className="flex items-center gap-6">

        <a
          href="/"
          className="font-medium text-gray-700 hover:text-black"
        >
          Dashboard
        </a>


        <a
          href="/campaigns"
          className="font-medium text-gray-700 hover:text-black"
        >
          Campaigns
        </a>


        <a
          href="/analytics"
          className="font-medium text-gray-700 hover:text-black"
        >
          Analytics
        </a>


        <a
          href="/profile"
          className="font-medium text-gray-700 hover:text-black"
        >
          Profile
        </a>

      </div>


      {/* =========================
          LOGOUT BUTTON
          ========================= */}

      <button
        onClick={handleLogout}
        className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Logout
      </button>

    </nav>
  );
}