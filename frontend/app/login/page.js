"use client";

import { useState } from "react";

// Login page
// Ye page user ko backend ke saath login karayega
export default function Login() {

  // Email ki value store karne ke liye
  const [email, setEmail] = useState("");

  // Password ki value store karne ke liye
  const [password, setPassword] = useState("");

  // Login ke time message show karne ke liye
  const [message, setMessage] = useState("");

  // Form submit hone par ye function chalega
  const handleLogin = async (event) => {

    // Page reload hone se rokna
    event.preventDefault();

    // Purana message clear karna
    setMessage("");

    try {

      // Backend login API ko request bhejna
      const response = await fetch(
        "https://smart-qr-marketing-platform.onrender.com/api/users/login",
        {
          method: "POST",

          // Backend ko batana ki JSON data bhej rahe hain
          headers: {
            "Content-Type": "application/json",
          },

          // Email aur password backend ko bhejna
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      // Backend ka response JSON me convert karna
      const data = await response.json();

      // Agar login successful hai
      if (response.ok) {

        // JWT token browser ke localStorage me save karna
        localStorage.setItem("token", data.token);

        // User information bhi save karna
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // Success message
        setMessage("Login successful!");

        // Dashboard par bhejna
        window.location.href = "/";
      } else {

        // Backend se aaya error message
        setMessage(data.message || "Login failed");
      }

    } catch (error) {

      // Server connect na hone par error
      console.error("Login Error:", error);

      setMessage("Server se connection nahi ho raha.");
    }
  };


  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-gray-600">
          Login to your Smart QR Marketing account.
        </p>


        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          {/* Email Input */}
          <div>

            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-black"
            />

          </div>


          {/* Password Input */}
          <div>

            <label className="mb-2 block font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-black"
            />

          </div>


          {/* Login Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800"
          >
            Login
          </button>

        </form>


        {/* Backend se aaya message */}
        {message && (
          <p className="mt-4 text-center text-sm font-medium">
            {message}
          </p>
        )}


        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}

          <a
            href="/signup"
            className="font-semibold text-black hover:underline"
          >
            Sign Up
          </a>

        </p>

      </div>

    </main>
  );
}