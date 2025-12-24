// src/lib/mongoose.js
import mongoose from "mongoose";

/**
 * Global cache to prevent multiple MongoDB connections
 * during hot reloads and API route re-use (Next.js App Router).
 */
const globalAny = globalThis;

if (!globalAny.__mongoose) {
  globalAny.__mongoose = {
    conn: null,
    promise: null,
  };
}

const cached = globalAny.__mongoose;

/**
 * Connect to MongoDB
 * ❗ Runtime-safe (no build-time crashes)
 */
export async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  // ✅ Runtime-only env validation (SAFE for build)
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Set it in environment variables.");
  }

  // Reuse existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Create connection once
  if (!cached.promise) {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongooseInstance) => mongooseInstance)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
export { dbConnect as connectToDatabase };
