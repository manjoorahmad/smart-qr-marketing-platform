"use client";

import { useState } from "react";

// Signup page
// Ye page new user ko backend me register karega
export default function Signup() {

  // User ka name store karne ke liye
  const [name, setName] = useState("");

  // User ka email store karne ke liye
  const [email, setEmail] = useState("");

  // User ka password store karne ke liye
  const [password, setPassword] = useState("");

  // Backend ka message show karne ke liye
  const [message, setMessage] = useState("");

  // Form submit hone par ye function chalega
  const handleSignup = async (event) => {

    // Page reload hone se rokna
    event.preventDefault();

    // Purana message clear karna
    setMessage("");

    try {

      // Backend signup API ko request bhejna
      const response = await fetch(
        "https://smart-qr-marketing-platform.onrender.com/api/users/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          // User ka data backend ko bhejna
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      // Backend response ko JSON me convert karna
      const data = await response.json();

      // Agar signup successful hai
      if (response.ok) {

        // Success message show karna
        setMessage("Signup successful! Ab login karein.");

        // 1 second baad Login page par bhejna
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);

      } else {

        // Backend se aaya error message show karna
        setMessage(data.message || "Signup failed");
      }

    } catch (error) {

      // Backend connect na hone par error
      console.error("Signup Error:", error);

      setMessage("Server se connection nahi ho raha.");
    }
  };


  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

      {/* Signup Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-gray-600">
          Create your Smart QR Marketing account.
        </p>


        {/* Signup Form */}
        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-5"
        >

          {/* Name Input */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-black"
            />
          </div>


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
              minLength={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-black"
            />
          </div>


          {/* Signup Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800"
          >
            Sign Up
          </button>

        </form>


        {/* Backend message */}
        {message && (
          <p className="mt-4 text-center text-sm font-medium">
            {message}
          </p>
        )}


        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}

          <a
            href="/login"
            className="font-semibold text-black hover:underline"
          >
            Login
          </a>

        </p>

      </div>

    </main>
  );
}