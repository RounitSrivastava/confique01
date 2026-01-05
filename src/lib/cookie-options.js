// src/lib/cookie-options.js

export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  // Allow insecure cookies in dev, secure in prod
  const secureFlag = isProd
    ? process.env.SECURE_COOKIES !== "false"
    : false;

  return {
    name: "confique_token",

    // ❗ Base options ONLY (shared by login + logout)
    cookieOptions: {
      httpOnly: true,
      path: "/",          // 🔴 REQUIRED
      sameSite: "lax",
      secure: !!secureFlag,
    },
  };
}
