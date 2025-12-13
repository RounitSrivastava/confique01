// src/app/api/cloudinary/sign/route.js (App Router)
import { NextResponse } from "next/server";
import { getUploadSignature } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/cloudinary/sign?folder=some/folder
 * Returns: { ok: true, timestamp, signature, apiKey, cloudName }
 */
export async function GET(req) {
  try {
    // OPTIONAL: require logged-in user
    // const user = await getCurrentUser(req);
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    let folder = searchParams.get("folder") || undefined;

    // sanitize folder: allow only [a-zA-Z0-9/_-] and limit length
    if (typeof folder === "string") {
      folder = folder.trim().slice(0, 200);
      if (!/^[\w\-\/]+$/.test(folder)) folder = undefined;
    }

    const paramsToSign = folder ? { folder } : {};
    const sig = getUploadSignature(paramsToSign);

    // no-cache because signature is short-lived
    const headers = { "Cache-Control": "no-store" };

    return NextResponse.json({ ok: true, ...sig }, { headers });
  } catch (err) {
    console.error("Failed to get Cloudinary signature", err);
    // Hide sensitive details
    return NextResponse.json({ error: "Failed to create signature" }, { status: 500 });
  }
}
