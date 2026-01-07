import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose"; // ✅ Edge-compatible JWT library
import { cookies } from "next/headers";

const PRIMARY_COOKIE_NAME = "confique_token";

/* ===================================================
   INTERNAL JWT CONFIG
=================================================== */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not defined");
    }
    // Fallback for development only
    return new TextEncoder().encode("dev_fallback_change_me_at_least_32_chars");
  }
  return new TextEncoder().encode(secret);
}

/* ===================================================
   PASSWORD HELPERS
=================================================== */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/* ===================================================
   TOKEN CREATION (Edge Compatible)
=================================================== */
export const createToken = async ({ userId, email, provider }) => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  // ✅ SignJWT is asynchronous and works in Middleware/Edge
  return await new SignJWT({ 
      sub: userId, 
      email, 
      provider 
    })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
};

/* ===================================================
   TOKEN VERIFY (Edge Compatible)
=================================================== */
export const verifyToken = async (token) => {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    return null;
  }
};

/* ===================================================
   AUTH HELPERS (APP ROUTER SAFE)
=================================================== */

/**
 * 🔐 Extract JWT token from cookies (App Router safe)
 */
export async function extractTokenFromRequest() {
  const cookieStore = await cookies(); 
  return cookieStore.get(PRIMARY_COOKIE_NAME)?.value || null;
}

/**
 * 👤 Get current authenticated user from JWT
 */
export async function getCurrentUser() {
  try {
    const token = await extractTokenFromRequest();
    if (!token) return null;

    const decoded = await verifyToken(token); // ✅ Must await async verify
    if (!decoded?.sub) return null;

    return {
      id: String(decoded.sub),
      email: decoded.email || null,
      provider: decoded.provider || "local",
    };
  } catch (err) {
    console.error("❌ getCurrentUser failed:", err);
    return null;
  }
}

export default getCurrentUser;