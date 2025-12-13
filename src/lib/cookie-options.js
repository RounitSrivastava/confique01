// src/lib/cookie-options.js
export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  // If you explicitly set SECURE_COOKIES=false in dev, allow non-secure cookies
  const secureFlag = isProd ? (process.env.SECURE_COOKIES !== "false") : false;

  // These must match exactly when setting and clearing the cookie.
  return {
    name: "confique_token",
    cookieOptions: {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: !!secureFlag,
      maxAge: 60 * 60 * 24 * 7 // seconds (7 days)
    }
  };
}
