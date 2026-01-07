/**
 * 🍪 Standardized cookie configuration for the Auth system.
 * This ensures consistency between login, logout, and middleware.
 */
export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  // Enforce secure cookies in production unless explicitly disabled for testing
  const secureFlag = isProd
    ? process.env.SECURE_COOKIES !== "false"
    : false;

  return {
    // 🔑 MUST match the cookie name used in your middleware.js
    name: "confique_token",

    // 🛡️ Security configuration
    cookieOptions: {
      httpOnly: true,     // Prevents client-side JS from accessing the token (XSS protection)
      path: "/",          // 🔴 REQUIRED: Ensures cookie is available across the entire site
      sameSite: "lax",    // Balance between security and usability for navigations
      secure: !!secureFlag, // Only send over HTTPS in production
    },
  };
}