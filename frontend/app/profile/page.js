"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

// Profile page
// Ye logged-in user ki information backend se fetch karega
export default function Profile() {

  // User information store karne ke liye
  const [user, setUser] = useState(null);

  // Loading ke liye
  const [loading, setLoading] = useState(true);

  // Error message ke liye
  const [error, setError] = useState("");


  // =========================
  // FETCH USER PROFILE
  // =========================

  useEffect(() => {
    fetchProfile();
  }, []);


  const fetchProfile = async () => {
    try {

      // Login ke baad save hua JWT token
      const token = localStorage.getItem("token");

      // Token nahi hai
      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }


      // Backend profile API
      const response = await fetch(
        "https://smart-qr-marketing-platform.onrender.com/api/users/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (response.ok) {

        // Backend se user information save kar rahe hain
        setUser(data.user);

      } else {

        setError(
          data.message || "Profile fetch nahi ho payi."
        );

      }

    } catch (error) {

      console.error("Profile Error:", error);

      setError("Server se connection nahi ho raha.");

    } finally {

      setLoading(false);

    }
  };


  return (
    <>
      {/* Navbar */}
      <Navbar />


      <main className="min-h-screen bg-gray-100 p-8">

        {/* Page Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Profile
          </h1>

          <p className="mt-2 text-gray-600">
            View your Smart QR Marketing account information.
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}


        {/* Loading */}

        {loading ? (

          <p className="text-gray-600">
            Loading profile...
          </p>

        ) : user ? (

          /* =========================
             PROFILE CARD
             ========================= */

          <section className="max-w-2xl rounded-xl bg-white p-8 shadow">

            {/* Profile Icon */}

            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black text-3xl font-bold text-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>


            {/* Name */}

            <div className="border-b py-4">

              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {user.name}
              </p>

            </div>


            {/* Email */}

            <div className="border-b py-4">

              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {user.email}
              </p>

            </div>


            {/* User ID */}

            <div className="py-4">

              <p className="text-sm text-gray-500">
                User ID
              </p>

              <p className="mt-1 break-all text-sm text-gray-700">
                {user._id}
              </p>

            </div>

          </section>

        ) : null}

      </main>
    </>
  );
}