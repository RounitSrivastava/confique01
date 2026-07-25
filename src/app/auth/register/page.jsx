"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

const CREDENTIALS = "include";

// Inner component that uses useSearchParams (must be inside Suspense)
function RegisterForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams ? searchParams.get("ref") : null;

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
          ref: refCode,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Registration failed");
        setLoading(false);
        return;
      }

      const cId = searchParams ? searchParams.get("c") : null;
      if (cId) {
        window.location.href = `/groups?c=${cId}`;
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-bg-1 text-text-1 overflow-hidden">
      {/* BACKGROUND */}
      <img
        src="/Black and Purple Modern Programming Presentation (1).png"
        alt="Background"
        className="fixed inset-0 h-full w-full object-cover"
      />

      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-1/40 backdrop-blur-sm">
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
              bg-white/80
              backdrop-blur-2xl
              border border-gray-200
              px-6 py-8
              shadow-[0_8px_30px_rgb(0,0,0,0.12)]
            "
          >
            {/* SUBTITLE ONLY */}
            <p className="mb-4 text-gray-600 text-sm">
              Sign up to get started
            </p>

            {/* GOOGLE */}
            <div className="mt-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign up failed")}
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>

            <div className="my-5 text-center text-xs text-gray-500">OR</div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Full Name"
                className="w-full rounded-full bg-white border border-gray-300
                           px-5 py-3 text-sm text-gray-900 transparent-autofill
                           placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Email"
                className="w-full rounded-full bg-white border border-gray-300
                           px-5 py-3 text-sm text-gray-900 transparent-autofill
                           placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm"
              />

              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                className="w-full rounded-full bg-white border border-gray-300
                           px-5 py-3 text-sm text-gray-900 transparent-autofill
                           placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm"
              />

              <input
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                type="password"
                placeholder="Confirm Password"
                className="w-full rounded-full bg-white border border-gray-300
                           px-5 py-3 text-sm text-gray-900 transparent-autofill
                           placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm"
              />

              <label className="flex items-start gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 shadow-sm"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-purple-600 font-semibold hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and Privacy Policy.
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

            <p className="mt-5 text-center text-xs text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-600 font-semibold hover:text-purple-500 transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Page component wraps the form in Suspense (required for useSearchParams in Next.js 15)
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-bg-1">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
