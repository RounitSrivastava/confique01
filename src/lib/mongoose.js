// src/lib/mongoose.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const isProd = process.env.NODE_ENV === "production";

if (!MONGODB_URI) {
    if (isProd) {
        throw new Error("❌ Missing MONGODB_URI environment variable (production).");
    } else {
        // warn but don't throw at import time (so dev server can start)
        // eslint-disable-next-line no-console
        console.warn(
            "⚠️ MONGODB_URI is not defined. Database operations will fail until you set it in .env.local."
        );
    }
}

/**
 * Global cache to avoid creating multiple Mongoose connections during
 * Hot Module Replacement in development (Next.js dev server).
 */
const globalAny = globalThis;

/** shape: { conn: mongoose.Mongoose | null, promise: Promise<mongoose.Mongoose> | null } */
if (!globalAny.__mongoose) {
    globalAny.__mongoose = { conn: null, promise: null };
}
const cached = globalAny.__mongoose;

export async function dbConnect() {
    if (!MONGODB_URI) {
        const err = new Error("Missing MONGODB_URI environment variable. Set it in .env.local.");
        // eslint-disable-next-line no-console
        console.error("❌ dbConnect aborted:", err.message);
        throw err;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        // Modern Mongoose (v6+/v7+) no longer accepts useNewUrlParser/useUnifiedTopology flags.
        // Provide sensible timeouts / pool settings instead.
        const connOpts = {
            // Pool size for connection reuse; adjust as needed.
            maxPoolSize: 10,
            // Fail fast if server selection cannot succeed
            serverSelectionTimeoutMS: 5000,
            // Connection attempt timeout
            connectTimeoutMS: 10000,
            // Keep sockets alive
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose
            .connect(MONGODB_URI, connOpts)
            .then((mongooseInstance) => {
                // eslint-disable-next-line no-console
                console.log("✅ Connected to MongoDB");
                return mongooseInstance;
            })
            .catch((err) => {
                // Reset cached.promise when initial connect fails so retry attempts can work.
                cached.promise = null;
                // eslint-disable-next-line no-console
                console.error("❌ Initial MongoDB connect error:", err && (err.message || err));
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (err) {
        // Clean up so future calls may retry
        cached.promise = null;
        // eslint-disable-next-line no-console
        console.error("❌ MongoDB connection error (final):", err && (err.stack || err.message) ? (err.stack || err.message) : err);
        throw err;
    }
}

export default dbConnect;
export { dbConnect as connectToDatabase };