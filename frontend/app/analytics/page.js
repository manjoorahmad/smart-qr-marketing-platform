"use client";

import { useEffect, useState } from "react";

// Analytics page
// Ye page backend se analytics data fetch karega
export default function Analytics() {

  // Analytics data store karne ke liye
  const [analytics, setAnalytics] = useState(null);

  // Loading ke liye
  const [loading, setLoading] = useState(true);

  // Error message ke liye
  const [error, setError] = useState("");


  // =========================
  // FETCH ANALYTICS
  // =========================

  useEffect(() => {
    fetchAnalytics();
  }, []);


  const fetchAnalytics = async () => {
    try {

      const token = localStorage.getItem("token");

      // Agar token nahi hai
      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }


      // Backend Analytics API call
      const response = await fetch(
        "http://localhost:5000/api/analytics",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (response.ok) {

        // Backend se analytics save kar rahe hain
        setAnalytics(data.analytics);

      } else {

        setError(
          data.message || "Analytics fetch nahi ho payi."
        );

      }

    } catch (error) {

      console.error("Analytics Error:", error);

      setError("Server se connection nahi ho raha.");

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-gray-600">
          Loading analytics...
        </p>
      </main>
    );
  }


  // =========================
  // PAGE
  // =========================

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      {/* PAGE HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="mt-2 text-gray-600">
          Track your QR campaign performance.
        </p>

      </div>


      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}


      {/* ANALYTICS CARDS */}

      {analytics && (
        <>
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


          {/* RECENT SCANS */}

          <section className="mt-8 rounded-xl bg-white p-8 shadow">

            <h2 className="text-2xl font-semibold text-gray-900">
              Recent Scans
            </h2>

            <p className="mt-2 text-gray-600">
              Latest QR code scans.
            </p>


            <div className="mt-6 space-y-4">

              {analytics.recentScans.length === 0 ? (

                <p className="text-gray-500">
                  No scans yet.
                </p>

              ) : (

                analytics.recentScans.map((scan) => (

                  <div
                    key={scan._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        {scan.campaign?.name || "Campaign"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {scan.device} • {scan.browser}
                      </p>

                    </div>


                    <p className="text-sm text-gray-500">
                      {new Date(
                        scan.scannedAt
                      ).toLocaleString()}
                    </p>

                  </div>

                ))

              )}

            </div>

          </section>

        </>
      )}

    </main>
  );
}