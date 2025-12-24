// src/app/api/cloudinary/sign/route.js
import { NextResponse } from "next/server";
import { getUploadSignature } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic"; // ✅ REQUIRED in Next.js 15

/**
 * GET /api/cloudinary/sign?folder=some/folder
 * Returns: { ok: true, timestamp, signature, apiKey, cloudName }
 */
export async function GET(req) {
  try {
    // OPTIONAL: require logged-in user
    // ⚠ If you enable this, getCurrentUser MUST be awaited
    // const user = await getCurrentUser(req);
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    let folder = searchParams.get("folder") || undefined;

    // Sanitize folder
    if (typeof folder === "string") {
      folder = folder.trim().slice(0, 200);
      if (!/^[\w\-\/]+$/.test(folder)) folder = undefined;
    }

    const paramsToSign = folder ? { folder } : {};
    const sig = getUploadSignature(paramsToSign);

    return NextResponse.json(
      { ok: true, ...sig },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Failed to get Cloudinary signature", err);
    return NextResponse.json(
      { error: "Failed to create signature" },
      { status: 500 }
    );
  }
}
