"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useSearchParams } from "next/navigation";

const CREDENTIALS = "include";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // === FORCE NATIVE DARK MODE ===
  // We use the CSS class .force-dark to perfectly override all CSS variables
  // instead of a race-condition-prone useEffect.

  const broadcastAuthChange = (user) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("confique:auth-changed", { detail: { user } })
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill both fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: CREDENTIALS,
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("userEmail", data.user.email);
broadcastAuthChange(data.user);
const redirect = searchParams.get("redirect");
window.location.href = redirect || "/";

    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleRes) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: CREDENTIALS,
        body: JSON.stringify({ idToken: googleRes.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError("Google authentication failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("userEmail", data.user.email);
broadcastAuthChange(data.user);
const redirect = searchParams.get("redirect");
window.location.href = redirect || "/";
    } catch {
      setError("Google login error");
      setLoading(false);
    }
  };

  return (
    <main className="force-dark fixed inset-0 bg-bg-1 text-text-1 overflow-hidden">
      {/* BACKGROUND */}
      <img
  src="/Black and Purple Modern Programming Presentation (1).png"
  alt="Background"
  className="absolute inset-0 w-full h-full object-cover"
 />

      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-1/40 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      )}

      {/* MAIN */}
      <div className="relative z-10 h-full flex items-center justify-center sm:justify-start px-4 sm:px-0">
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
            {/* HEADER */}
            <h1 className="text-4xl font-semibold text-gray-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              Sign in to continue
            </p>

            {/* GOOGLE */}
            <div className="mt-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>

            <div className="my-5 text-center text-xs text-gray-500">OR</div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full bg-white border border-gray-300
                           px-5 py-3 text-sm text-gray-900 transparent-autofill
                           placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full bg-white border border-gray-300
                           px-5 py-3 text-sm text-gray-900 transparent-autofill
                           placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm"
              />

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3 font-medium text-text-1
                           bg-gradient-to-r from-[#8B5CF6] to-[#5AC8FA]
                           hover:opacity-90 transition"
              >
                {loading ? "Verifying..." : "Log in"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-gray-600">
              Don’t have an account?{" "}
              <Link href={searchParams.get("redirect") ? `/auth/register?redirect=${searchParams.get("redirect")}` : "/auth/register"} className="text-purple-600 font-semibold hover:text-purple-500 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
