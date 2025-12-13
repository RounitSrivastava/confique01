// LoginPage.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation"; // <-- ADD useSearchParams

const slides = ["/auth-slide-1.jpg", "/auth-slide-2.jpg", "/auth-slide-3.jpg"];

// Always include credentials so HTTP-only cookie is sent/accepted reliably
const CREDENTIALS = "include";

export default function LoginPage() {
  const [idx, setIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // <-- Initialize useSearchParams

  // Background slider animation
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, []);

  // Server-side cookie auth check (server is source of truth)
  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      // 🔑 KEY FIX: Check for the logout flag here before fetching
      const isLogoutRedirect = searchParams.get('loggedOut') === 'true';

      // If we are coming from a logout, skip the re-authentication check
      // to avoid the race condition loop.
      if (isLogoutRedirect) {
          // If the user is on the login page specifically for logout, let them stay.
          return; 
      }

      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: CREDENTIALS,
          cache: "no-store",
        });

        if (!mounted) return;

        // parse JSON safely
        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        // ONLY redirect when server reports an authenticated user
        if (data?.user) {
          // already authenticated -> go to main
          if (pathname !== "/") {
            // use replace (client nav ok here because server already knows user)
            router.replace("/");
          }
        } else {
          // not authenticated -> stay on login page
        }
      } catch (err) {
        console.warn("auth check failed", err);
      }
    }
    checkAuth();
    return () => {
      mounted = false;
    };
  }, [router, pathname, searchParams]); // <-- ADD searchParams to dependencies

  // Handle login
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

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setError(data?.error || `Login failed (status ${res.status})`);
        return;
      }

      // SUCCESS — backend sets HTTP-only cookie.
      // persist minimal client info for UX, but server cookie is truth.
      try {
        if (typeof window !== "undefined" && data?.user) {
          const { email: userEmail, name: userName } = data.user;
          if (userEmail) localStorage.setItem("userEmail", userEmail);
          if (userName) localStorage.setItem("userName", userName);
        }
      } catch (err) {
        console.warn("Failed to store user in localStorage", err);
      }

      // *** FIX APPLIED: Use router.push for smooth, client-side navigation ***
      router.push("/");
      
    } catch (err) {
      console.error("Login error", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

            {/* RIGHT LOGIN FORM */}
            <section className="p-6 sm:p-10">
              <h1 className="text-3xl font-semibold">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-400">Sign in to continue</p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm mb-1 text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm mb-1 text-gray-300">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs text-purple-400">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-black text-white placeholder-gray-500 border border-gray-700 px-4 py-3"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white font-medium py-3 disabled:opacity-60"
                >
                  {loading ? "Logging in…" : "Log In"}
                </button>

                {/* OR Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-900/70 px-3 text-xs text-gray-400">OR</span>
                  </div>
                </div>

                {/* Google Button */}
                <button type="button" className="w-full flex items-center justify-center gap-3 rounded-xl bg-black hover:bg-gray-950 border border-gray-700 py-3">
                  <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
                  <span className="text-sm text-gray-200">Continue with Google</span>
                </button>
              </form>

              <p className="mt-8 text-sm text-gray-400">
                Don’t have an account? <Link href="/auth/register" className="text-purple-400">Sign Up</Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}