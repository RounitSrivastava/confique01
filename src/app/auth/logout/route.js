import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export const runtime = "nodejs";

export async function POST() {
  console.log("🔥 LOGOUT API HIT");

  const response = NextResponse.json({
    ok: true,
    message: "Logged out successfully",
  });

  // 1. Get standardized name and options
  const { name, cookieOptions } = getAuthCookieOptions();

  // 2. ✅ Delete cookie by matching the original configuration
  // We use expires: 0 to tell the browser to remove it immediately.
  response.cookies.set({
    ...cookieOptions,
    name: name,
    value: "",
    expires: new Date(0), // Set expiration to the past
  });

  return response;
}