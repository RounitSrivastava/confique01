// pages/api/health.js
import dbConnect from "@/lib/mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function handler(req, res) {
  try {
    await dbConnect();
    return res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("Health check - DB connect error:", err && (err.stack || err.message) ? (err.stack || err.message) : err);
    return res.status(500).json({
      status: "error",
      message: "Failed to connect to database",
      details: err?.message || "unknown error",
    });
  }
}
