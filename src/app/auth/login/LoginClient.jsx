"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added for client-side navigation
import { GoogleLogin } from "@react-oauth/google";

const slides = ["/auth-slide-1.jpg", "/auth-slide-2.jpg", "/auth-slide-3.jpg"];
const CREDENTIALS = "include";

export default function LoginClient() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Background slider animation
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, []);

  /* ---------------------------------
      EMAIL LOGIN
  ---------------------------------- */
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

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || `Login failed (${res.status})`);
        return;
      }

      // Force a full page reload to the dashboard/home 
      // so the middleware re-validates the new cookie immediately
      window.location.href = "/";
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------
      GOOGLE LOGIN
  ---------------------------------- */
  const handleGoogleSuccess = async (googleRes) => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: CREDENTIALS,
        body: JSON.stringify({
          idToken: googleRes.credential,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Google authentication failed.");
        return;
      }

      // Success! Redirect to protected area
      window.location.href = "/";
    } catch (err) {
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Background Image & Overlay */}
      <img
        src="https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg"
        className="fixed inset-0 h-full w-full object-cover opacity-30"
        alt=""
      />
      <div className="fixed inset-0 bg-black/60" />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gray-900/70 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* LEFT (Slideshow) */}
            <aside className="relative hidden md:block">
              {slides.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                    i === idx ? "opacity-100" : "opacity-0"
                  }`}
                  alt=""
                />
              ))}
              <div className="absolute inset-0 bg-black/45" />
            </aside>

            {/* RIGHT (Form) */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-400">Sign in to continue</p>

              {/* GOOGLE LOGIN */}
              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google login was cancelled or failed.")}
                  theme="filled_black"
                  shape="pill"
                />
              </div>

              <div className="my-6 flex items-center gap-3 text-gray-500">
                <div className="h-px flex-1 bg-gray-700" />
                <span className="text-xs">OR</span>
                <div className="h-px flex-1 bg-gray-700" />
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={loading}
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={loading}
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                />

                {error && (
                  <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] py-3 font-medium hover:opacity-90 transition-opacity disabled:grayscale"
                >
                  {loading ? "Verifying..." : "Log In"}
                </button>
              </form>

              <p className="mt-8 text-sm text-gray-400 text-center">
                Don’t have an account?{" "}
                <Link href="/auth/register" className="text-purple-400 hover:underline">
                  Sign Up
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}