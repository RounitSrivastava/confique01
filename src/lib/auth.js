// lib/auth.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies as nextCookies } from "next/headers";

// ------------------------------
// ENV CHECKS (safe & explicit)
// ------------------------------
const isProd = process.env.NODE_ENV === "production";
if (!process.env.JWT_SECRET) {
    if (isProd) {
        throw new Error("❌ JWT_SECRET is not defined in environment variables (production).");
    } else {
        // eslint-disable-next-line no-console
        console.warn(
            "⚠️ JWT_SECRET is not defined — using development fallback. " +
            "Set JWT_SECRET in .env.local to avoid this message."
        );
    }
}
const JWT_SECRET = process.env.JWT_SECRET || "dev_fallback_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ------------------------------
// PASSWORD HELPERS
// ------------------------------
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// ------------------------------
// TOKEN CREATION
// ------------------------------
export const createToken = ({ userId, email }) => {
    return jwt.sign(
        {
            sub: userId,
            userId,
            email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// ------------------------------
// TOKEN VERIFY UTILITIES
// ------------------------------
export const verifyTokenStrict = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

// ------------------------------
// REQUEST HELPERS
// ------------------------------
const getHeaderValue = (req, name) => {
    try {
        if (!req || !req.headers) return "";

        // Next Request-like (Headers)
        if (typeof req.headers.get === "function") {
            const v = req.headers.get(name);
            return typeof v === "string" ? v : "";
        }

        // Node-like headers object (values may be string or array)
        const raw = req.headers[name] ?? req.headers[name.toLowerCase()] ?? "";
        if (Array.isArray(raw)) return String(raw[0] || "");
        return typeof raw === "string" ? raw : "";
    } catch {
        return "";
    }
};

/**
 * Extract JWT token from multiple possible sources:
 * 1) next/headers cookies() (server App Router)
 * 2) cookie header on req
 * 3) Authorization: Bearer <token>
 */
export async function extractTokenFromRequest(req) {
    const PRIMARY_COOKIE_NAME = "confique_token";
    
    // 1) next/headers cookies() (Preferred method in App Router)
    try {
        if (typeof nextCookies === "function") {
            // FIX APPLIED: Access cookies directly for Next.js sync context
            const cookieStore = nextCookies();
            const token = cookieStore.get(PRIMARY_COOKIE_NAME)?.value || null;
            if (token) return String(token).trim();
        }
    } catch (e) {
        // This catch handles errors when cookies() is called outside a Request/Server Component lifecycle
        if (!isProd) {
            console.warn(`extractTokenFromRequest: reading nextCookies() failed (This is common in edge functions or certain contexts): ${e?.message || e}`);
        }
    }

    // 2) cookie header (Fallback for Node environment or when nextCookies fails)
    try {
        const cookieHeader = getHeaderValue(req, "cookie") || "";
        if (cookieHeader) {
            // Regex to find the primary token
            const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${PRIMARY_COOKIE_NAME}=([^;]+)`));
            if (match) return decodeURIComponent(String(match[1]).trim());
        }
    } catch {}

    // 3) Authorization header (Bearer)
    try {
        const authHeader = getHeaderValue(req, "authorization") || "";
        if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
            return authHeader.slice(7).trim();
        }
    } catch {}

    return null;
}

// ------------------------------
// MAIN AUTH FUNCTION
// ------------------------------
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
        console.error("❌ getCurrentUser failed:", err?.message || String(err));
        return null;
    }
}

export default getCurrentUser;