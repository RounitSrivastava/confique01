import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "confique_token";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. PUBLIC ROUTES: Allow these without a token
  if (
    pathname.startsWith("/auth") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname === "/" || // ✅ Allow landing page
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. READ COOKIE
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 3. VERIFY JWT
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return NextResponse.next();
  } catch (err) {
    // If token is invalid/expired, clear cookie and send to login
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }
}

// 4. MATCHER: Exclude static files and assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};