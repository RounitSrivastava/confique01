import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "confique_token";

// Pre-encode the secret outside the function for a tiny speed boost
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. FAST PATH: Read cookie immediately
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 2. LOGIC: If on Auth pages and HAS token, skip to Dashboard/Home
  // This makes the transition back from login instant.
  if (pathname.startsWith("/auth")) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 3. SECURE PATH: If NO token, redirect to login instantly
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  /* ===============================
      3️⃣ VERIFY JWT (Only if token exists)
  =============================== */
  try {
    // We verify the signature only. 
    // Edge runtime is fast, but this is the most expensive part.
    await jwtVerify(token, SECRET);
    return NextResponse.next();

  } catch (err) {
    // Invalid token? Clear it and snap to login
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }
}

/* ===============================
    4️⃣ OPTIMIZED MATCHER
=============================== */
export const config = {
  // We use the matcher to EXCLUDE paths before the middleware even wakes up.
  // This is much faster than using "if (pathname.startsWith(...))"
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (internal API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)',
  ],
};