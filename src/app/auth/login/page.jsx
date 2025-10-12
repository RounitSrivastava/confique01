// app/login/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = ["/auth-slide-1.jpg", "/auth-slide-2.jpg", "/auth-slide-3.jpg"];

export default function LoginPage() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Page background image */}
      <img
        src="/background.jpg"
        alt=""
        className="pointer-events-none select-none fixed inset-0 h-full w-full object-cover opacity-30"
      />
      {/* Matte overlay for luxury depth */}
      <div className="fixed inset-0 bg-black/60" />

      {/* Centered auth box */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gray-900/70 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: carousel (hidden on small if you prefer) */}
            <aside className="relative hidden md:block">
              {slides.map((src, i) => (
                <img
                  key={src}
                  src="/login1.jpg"
                  alt=""
                  className={[
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
                    i === idx ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              ))}
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute left-6 right-6 bottom-6">
                <p className="text-2xl font-semibold leading-tight">
                  “Design with intention, execute with elegance.”
                </p>
                <p className="mt-1 text-sm text-white/70">A mindful builder</p>
              </div>
            </aside>

            {/* Right: login form */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-400">Sign in to continue</p>

              <form className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm mb-1 text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm mb-1 text-gray-300">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-700 bg-black text-purple-600 focus:ring-purple-600"
                  />
                  Remember Me
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] hover:opacity-95 text-white font-medium py-3 shadow-[0_10px_30px_rgba(106,17,203,0.35)] transition"
                >
                  Log In
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-900/70 px-3 text-xs text-gray-400">OR</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-black hover:bg-gray-950 border border-gray-700 py-3 transition"
                >
                  <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
                  <span className="text-sm text-gray-200">Continue with Google</span>
                </button>
              </form>

              <p className="mt-8 text-sm text-gray-400">
                Don’t have an account?{" "}
                <Link href="/auth/register" className="text-purple-400 hover:text-purple-300">
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
