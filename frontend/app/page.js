"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

// Dashboard page
// Ye page sirf logged-in user ke liye available hoga
export default function Home() {

  // Analytics data store karne ke liye
  const [analytics, setAnalytics] = useState(null);

  // Loading ke liye
  const [loading, setLoading] = useState(true);

  // Error message ke liye
  const [error, setError] = useState("");


  // =========================
  // LOGIN CHECK
  // =========================

  const checkLogin = () => {

    // Browser se JWT token le rahe hain
    const token = localStorage.getItem("token");

    // Token nahi hai
    if (!token) {
      window.location.href = "/login";
      return false;
    }

    return true;
  };


  // =========================
  // FETCH ANALYTICS
  // =========================

  const fetchAnalytics = async () => {

    try {

      // Login ke baad save hua JWT token
      const token = localStorage.getItem("token");

      // Token nahi mila
      if (!token) {
        window.location.href = "/login";
        return;
      }


      // Backend Analytics API
      const response = await fetch(
        "https://smart-qr-marketing-platform.onrender.com/api/analytics",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      // API successful
      if (response.ok) {

        // Real analytics data save kar rahe hain
        setAnalytics(data.analytics);

      }

      // Token invalid ya expired
      else if (response.status === 401) {

        // Purana token remove
        localStorage.removeItem("token");

        // User information bhi remove
        localStorage.removeItem("user");

        // Login page par redirect
        window.location.href = "/login";

      }

      // Other error
      else {

        setError(
          data.message || "Analytics fetch nahi ho payi."
        );

      }

    } catch (error) {

      console.error(
        "Dashboard Analytics Error:",
        error
      );

      setError(
        "Server se connection nahi ho raha."
      );

    } finally {

      setLoading(false);
    }
  };


  // =========================
  // PAGE LOAD
  // =========================

  useEffect(() => {

  // Page visible hone par login check hoga
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      if (checkLogin()) {
        fetchAnalytics();
      }
    }
  };

  // Page load hote hi login check
  if (checkLogin()) {
    fetchAnalytics();
  }

  // Page dobara visible hone par bhi check
  window.addEventListener("pageshow", handleVisibilityChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup
  return () => {
    window.removeEventListener("pageshow", handleVisibilityChange);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

}, []);


  // =========================
  // DASHBOARD UI
  // =========================

  return (
    <>
      {/* Navbar */}
      <Navbar />


      <main className="min-h-screen bg-gray-100 p-8">

        {/* =========================
            PAGE HEADER
            ========================= */}

        <header className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Smart QR Marketing
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your QR campaigns and track your marketing performance.
          </p>

        </header>


        {/* =========================
            ERROR MESSAGE
            ========================= */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}


        {/* =========================
            LOADING
            ========================= */}

        {loading ? (

          <p className="text-gray-600">
            Loading dashboard...
          </p>

        ) : analytics ? (

          <>

            {/* =========================
                ANALYTICS CARDS
                ========================= */}

            <section className="grid gap-6 md:grid-cols-3">

              {/* Total Campaigns */}

              <div className="rounded-xl bg-white p-6 shadow">

                <p className="text-gray-500">
                  Total Campaigns
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics.totalCampaigns}
                </h2>

              </div>


              {/* Total Scans */}

              <div className="rounded-xl bg-white p-6 shadow">

                <p className="text-gray-500">
                  Total Scans
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics.totalScans}
                </h2>

              </div>


              {/* Active Campaigns */}

              <div className="rounded-xl bg-white p-6 shadow">

                <p className="text-gray-500">
                  Active Campaigns
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics.activeCampaigns}
                </h2>

              </div>

            </section>


            {/* =========================
                WELCOME SECTION
                ========================= */}

            <section className="mt-8 rounded-xl bg-white p-8 shadow">

              <h2 className="text-2xl font-semibold text-gray-900">
                Welcome to Smart QR Marketing 🚀
              </h2>

              <p className="mt-3 text-gray-600">
                Create QR campaigns, generate QR codes and track your scans
                from one dashboard.
              </p>


              {/* Create Campaign Button */}

              <a
                href="/campaigns"
                className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
              >
                Create Campaign
              </a>

            </section>

          </>

        ) : null}

      </main>
    </>
  );
}