"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";

const CREDENTIALS = "include";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------
      GOOGLE REGISTER
  ---------------------------------- */
  const handleGoogleSuccess = async (res) => {
    setLoading(true);
    try {
      await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: CREDENTIALS,
        body: JSON.stringify({ idToken: res.credential }),
      });
      window.location.href = "/";
    } catch {
      setError("Google sign up failed");
      setLoading(false);
    }
  };

  /* ---------------------------------
      EMAIL REGISTER
  ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError("Please fill all fields.");
    }

    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    if (!agree) {
      return setError("You must agree to the Terms & Conditions.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: CREDENTIALS,
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Registration failed");
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* BACKGROUND */}
      <img
        src="/bgconf.jpeg"
        alt="Background"
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div className="fixed inset-0 bg-black/40" />

      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      )}

      {/* MAIN */}
      <div className="relative z-10 min-h-screen flex items-center justify-center sm:justify-start px-4 sm:px-0">
        <div className="w-full max-w-[380px] ml-0 sm:ml-10 lg:ml-14">
          {/* CARD */}
          <div
            className="
              rounded-3xl
              bg-white/[0.06]
              backdrop-blur-[44px]
              border border-white/10
              px-6 py-8
              shadow-[0_30px_80px_rgba(0,0,0,0.6)]
            "
          >
            {/* SUBTITLE ONLY */}
            <p className="mb-4 text-gray-400 text-sm">
              Sign up to get started
            </p>

            {/* GOOGLE */}
            <div className="mt-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign up failed")}
                theme="filled_black"
                shape="pill"
                width="100%"
              />
            </div>

            <div className="my-5 text-center text-xs text-gray-400">OR</div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Full Name"
                className="w-full rounded-full bg-[#2a2a2a]
                           px-5 py-3 text-sm text-white
                           placeholder-gray-400 outline-none"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Email"
                className="w-full rounded-full bg-[#2a2a2a]
                           px-5 py-3 text-sm text-white
                           placeholder-gray-400 outline-none"
              />

              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                className="w-full rounded-full bg-[#2a2a2a]
                           px-5 py-3 text-sm text-white
                           placeholder-gray-400 outline-none"
              />

              <input
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                type="password"
                placeholder="Confirm Password"
                className="w-full rounded-full bg-[#2a2a2a]
                           px-5 py-3 text-sm text-white
                           placeholder-gray-400 outline-none"
              />

              <label className="flex items-start gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-400 underline">
                    Terms & Conditions
                  </Link>
                </span>
              </label>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3 font-medium text-white
                           bg-gradient-to-r from-[#8B5CF6] to-[#5AC8FA]
                           hover:opacity-90 transition"
              >
                {loading ? "Creating..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
