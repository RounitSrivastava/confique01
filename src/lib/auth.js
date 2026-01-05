import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/* ===================================================
   INTERNAL JWT CONFIG
=================================================== */
function getJwtConfig() {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not defined");
    } else {
      console.warn(
        "⚠️ JWT_SECRET not set — using dev fallback. Set JWT_SECRET in .env.local"
      );
      return {
        secret: "dev_fallback_change_me",
        expiresIn,
      };
    }
  }

  return { secret, expiresIn };
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
   TOKEN CREATION
=================================================== */
export const createToken = ({ userId, email, provider }) => {
  const { secret, expiresIn } = getJwtConfig();

  return jwt.sign(
    {
      sub: userId,
      email,
      provider,
    },
    secret,
    { expiresIn }
  );
};

/* ===================================================
   TOKEN VERIFY
=================================================== */
export const verifyToken = (token) => {
  try {
    const { secret } = getJwtConfig();
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

export const verifyTokenStrict = (token) => {
  const { secret } = getJwtConfig();
  return jwt.verify(token, secret);
};

/* ===================================================
   AUTH HELPERS (APP ROUTER SAFE)
=================================================== */
const PRIMARY_COOKIE_NAME = "confique_token";

/**
 * 🔐 Extract JWT token from cookies (App Router safe)
 */
export async function extractTokenFromRequest() {
  const cookieStore = await cookies(); // 🔥 MUST await in App Router
  return cookieStore.get(PRIMARY_COOKIE_NAME)?.value || null;
}

/**
 * 👤 Get current authenticated user from JWT
 */
export async function getCurrentUser() {
  try {
    const token = await extractTokenFromRequest();
    if (!token) return null;

    const decoded = verifyToken(token);
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
