"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const slides = ["/auth-slide-1.jpg", "/auth-slide-2.jpg", "/auth-slide-3.jpg"];
const CREDENTIALS = "include";

export default function LoginClient() {
  const [idx, setIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      AUTH CHECK (SERVER = SOURCE OF TRUTH)
  ---------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const isLogoutRedirect = searchParams.get("loggedOut") === "true";
      if (isLogoutRedirect) return;

      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: CREDENTIALS,
          cache: "no-store",
        });

        if (!mounted) return;

        const data = await res.json().catch(() => null);

        if (data?.user && pathname !== "/") {
          router.replace("/");
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, [router, pathname, searchParams]);

  /* ---------------------------------
      HANDLE LOGIN
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

      // Optional UX storage
      try {
        if (data?.user?.email)
          localStorage.setItem("userEmail", data.user.email);
        if (data?.user?.name)
          localStorage.setItem("userName", data.user.name);
      } catch {}

      // 🔥 Hard reload ensures cookie is available
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------
      UI
  ---------------------------------- */
  return (
    <main className="min-h-screen bg-black text-white relative">
      <img
        src="https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg?w=200&h=200&fit=crop"
        alt=""
        className="pointer-events-none select-none fixed inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="fixed inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gray-900/70 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* LEFT SLIDESHOW */}
            <aside className="relative hidden md:block">
              {slides.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                    i === idx ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute left-6 right-6 bottom-6">
                <p className="text-2xl font-semibold leading-tight">
                  “Design with intention, execute with elegance.”
                </p>
                <p className="mt-1 text-sm text-white/70">
                  A mindful builder
                </p>
              </div>
            </aside>

            {/* RIGHT LOGIN FORM */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-400">
                Sign in to continue
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label className="block text-sm mb-1 text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="block text-sm mb-1 text-gray-300">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs text-purple-400">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] py-3 font-medium disabled:opacity-60"
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
