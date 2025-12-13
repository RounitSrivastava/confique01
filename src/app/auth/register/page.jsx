// components/RegisterPage.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Converted to plain .js (no TypeScript types)
export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError("Please fill all fields.");
    }
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (!agree) return setError("You must agree to the Terms & Conditions.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // << important: allow browser to accept Set-Cookie
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      // parse JSON safely
      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        // ignore parse error; will handle via res.ok
      }

      if (!res.ok) {
        setError(data?.error || `Registration failed (status ${res.status}).`);
        return;
      }

      // success: persist minimal local info for UX, but server cookie is source of truth.
      try {
        if (data?.user?.email) {
          localStorage.setItem("userEmail", data.user.email);
        } else {
          localStorage.setItem("userEmail", form.email);
        }
      } catch {}

      // *** FIX APPLIED: Use router.push for smooth, client-side navigation ***
      router.push("/");
      
    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <aside className="relative hidden md:block">
              <img src="/register-side.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute left-6 right-6 bottom-6">
                <p className="text-2xl font-semibold leading-tight">“Join the platform and host your dream events.”</p>
                <p className="mt-1 text-sm text-white/70">Evently Team</p>
              </div>
            </aside>

            {/* Right: form */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Create your account</h1>
              <p className="mt-1 text-sm text-gray-400">Host, share and discover amazing events.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />

                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />

                <input
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  type="password"
                  placeholder="Confirm password"
                  className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />

                <label className="flex items-start gap-2 text-sm text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-700 bg-black text-purple-600 focus:ring-purple-600"
                  />
                  <span className="leading-tight">I agree to the{" "}
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline">
                      Terms & Conditions
                    </Link>
                  </span>
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] hover:opacity-95 text-white font-medium py-3 shadow-[0_10px_30px_rgba(106,17,203,0.35)] transition disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Sign Up"}
                </button>

                {/* Divider */}
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