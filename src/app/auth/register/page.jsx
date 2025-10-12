// app/register/page.jsx
"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Page background image */}
      <img
        src="/background.jpg"
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="fixed inset-0 bg-black/60" />

      {/* Centered auth box */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gray-900/70 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: image panel */}
            <aside
              className="relative hidden md:block"
            >
              <img
                src="/register-side.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute left-6 right-6 bottom-6">
                <p className="text-2xl font-semibold leading-tight">
                  “Join the platform and host your dream events.”
                </p>
                <p className="mt-1 text-sm text-white/70">Evently Team</p>
              </div>
            </aside>

            {/* Right: form */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Create your account</h1>
              <p className="mt-1 text-sm text-gray-400">
                Host, share and discover amazing events.
              </p>

              <form className="mt-8 space-y-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />

                <label className="flex items-start gap-2 text-sm text-gray-300 select-none">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-700 bg-black text-purple-600 focus:ring-purple-600"
                  />
                  I agree to the{" "}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline">
                    Terms & Conditions
                  </Link>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] hover:opacity-95 text-white font-medium py-3 shadow-[0_10px_30px_rgba(106,17,203,0.35)] transition"
                >
                  Sign Up
                </button>

                {/* Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-900/70 px-3 text-xs text-gray-400">
                      OR
                    </span>
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
                Already have an account?{" "}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
                  Log in
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
