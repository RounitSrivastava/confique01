import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "confique_token";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  /* ===============================
     1️⃣ PUBLIC ROUTES (NO AUTH)
  =============================== */
  if (
    pathname.startsWith("/auth") ||        // login, signup
    pathname.startsWith("/api") ||         // APIs handle auth themselves
    pathname.startsWith("/_next") ||       // Next internals
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  /* ===============================
     2️⃣ READ COOKIE
  =============================== */
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // ❌ Not logged in → redirect
  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/login", req.url)
    );
  }

  /* ===============================
     3️⃣ VERIFY JWT
  =============================== */
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // ✅ Valid token → allow request
    return NextResponse.next();

  } catch (err) {
    // ❌ Invalid / expired token → force login
    const res = NextResponse.redirect(
      new URL("/auth/login", req.url)
    );

    // 🔥 HARD DELETE COOKIE (IMPORTANT)
    res.cookies.set(AUTH_COOKIE_NAME, "", {
      path: "/",
      maxAge: 0,
    });

    return res;
  }
}

/* ===============================
   4️⃣ MATCHER
=============================== */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
