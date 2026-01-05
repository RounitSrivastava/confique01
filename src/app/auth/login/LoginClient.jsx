"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { GoogleLogin } from "@react-oauth/google";

const slides = ["/auth-slide-1.jpg", "/auth-slide-2.jpg", "/auth-slide-3.jpg"];
const CREDENTIALS = "include";

export default function LoginClient() {
  const [idx, setIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  /* ---------------------------------
      Background slider animation
  ---------------------------------- */
  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % slides.length),
      4500
    );
    return () => clearInterval(id);
  }, []);

  /* ---------------------------------
      AUTH CHECK
  ---------------------------------- */
  

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

      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------
      GOOGLE LOGIN
  ---------------------------------- */
  const handleGoogleSuccess = async (res) => {
    try {
      await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: CREDENTIALS,
        body: JSON.stringify({
          idToken: res.credential,
        }),
      });

      window.location.href = "/";
    } catch {
      setError("Google login failed");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      <img
        src="https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg"
        className="fixed inset-0 h-full w-full object-cover opacity-30"
        alt=""
      />
      <div className="fixed inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gray-900/70 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* LEFT */}
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

            {/* RIGHT */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-400">Sign in to continue</p>

              {/* GOOGLE LOGIN */}
              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google login failed")}
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
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                />

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] py-3 font-medium"
                >
                  {loading ? "Logging in…" : "Log In"}
                </button>
              </form>

              <p className="mt-8 text-sm text-gray-400">
                Don’t have an account?{" "}
                <Link href="/auth/register" className="text-purple-400">
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
