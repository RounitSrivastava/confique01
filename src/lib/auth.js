// lib/auth.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies as nextCookies } from "next/headers";

/* ===================================================
   INTERNAL JWT CONFIG (SAFE FOR APP ROUTER)
=================================================== */
function getJwtConfig() {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      // ❗ throw ONLY at runtime, never at import time
      throw new Error("JWT_SECRET is not defined");
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        "⚠️ JWT_SECRET is not defined — using dev fallback. " +
        "Set JWT_SECRET in .env.local to remove this warning."
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
export const createToken = ({ userId, email }) => {
  const { secret, expiresIn } = getJwtConfig();

  return jwt.sign(
    {
      sub: userId,
      userId,
      email,
    },
    secret,
    { expiresIn }
  );
};

/* ===================================================
   TOKEN VERIFY
=================================================== */
export const verifyTokenStrict = (token) => {
  const { secret } = getJwtConfig();
  return jwt.verify(token, secret);
};

export const verifyToken = (token) => {
  try {
    const { secret } = getJwtConfig();
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

/* ===================================================
   REQUEST HELPERS
=================================================== */
const PRIMARY_COOKIE_NAME = "confique_token";

const getHeaderValue = (req, name) => {
  try {
    if (!req || !req.headers) return "";

    // Next.js Request headers
    if (typeof req.headers.get === "function") {
      const v = req.headers.get(name);
      return typeof v === "string" ? v : "";
    }

    // Node-style headers
    const raw = req.headers[name] ?? req.headers[name.toLowerCase()];
    if (Array.isArray(raw)) return String(raw[0] || "");
    return typeof raw === "string" ? raw : "";
  } catch {
    return "";
  }
};

/**
 * Extract token from:
 * 1) next/headers cookies()  ✅ App Router
 * 2) Cookie header
 * 3) Authorization: Bearer
 */
export async function extractTokenFromRequest(req) {
  // 1️⃣ App Router cookies()
  try {
    const cookieStore = nextCookies();
    const token = cookieStore.get(PRIMARY_COOKIE_NAME)?.value;
    if (token) return token.trim();
  } catch {
    // Safe to ignore — happens in edge/static contexts
  }

  // 2️⃣ Cookie header fallback
  try {
    const cookieHeader = getHeaderValue(req, "cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(
        new RegExp(`(?:^|;\\s*)${PRIMARY_COOKIE_NAME}=([^;]+)`)
      );
      if (match) return decodeURIComponent(match[1]);
    }
  } catch {}

  // 3️⃣ Authorization header
  try {
    const authHeader = getHeaderValue(req, "authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
  } catch {}

  return null;
}

/* ===================================================
   CURRENT USER
=================================================== */
export async function getCurrentUser(req) {
  try {
    const token = await extractTokenFromRequest(req);
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const id = decoded.sub || decoded.userId || decoded.id;
    if (!id) return null;

    return {
      id: String(id),
      email: decoded.email || null,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ getCurrentUser failed:", err?.message || err);
    return null;
  }
}

export default getCurrentUser;
