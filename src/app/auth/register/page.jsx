// components/RegisterPage.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

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
        credentials: "include", // 🔑 REQUIRED for cookie
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        setError(data?.error || `Registration failed (${res.status})`);
        return;
      }

      // Optional UX cache (server cookie is source of truth)
      try {
        if (data?.user?.email) {
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userName", data.user.name || "");
        }
      } catch {}

      // ✅ IMPORTANT: hard redirect avoids auth race
      window.location.href = "/";
    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      <img
        src="/background.jpg"
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="fixed inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gray-900/70 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* LEFT IMAGE */}
            <aside className="relative hidden md:block">
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

            {/* FORM */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Create your account</h1>
              <p className="mt-1 text-sm text-gray-400">
                Host, share and discover amazing events.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                />

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                />

                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                />

                <input
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  type="password"
                  placeholder="Confirm password"
                  className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                />

                <label className="flex gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="text-purple-400 underline">
                      Terms & Conditions
                    </Link>
                  </span>
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] py-3 font-medium"
                >
                  {loading ? "Creating..." : "Sign Up"}
                </button>
              </form>

              <p className="mt-8 text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-purple-400">
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
