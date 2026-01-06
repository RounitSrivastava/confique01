import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  console.log("🔥 LOGOUT API HIT");

  const response = NextResponse.json({
    ok: true,
    message: "Logged out successfully",
  });

  // ✅ CORRECT way to delete cookie
  response.cookies.set({
    name: "confique_token",
    value: "",
    path: "/",          // MUST match original
    httpOnly: true,
    sameSite: "lax",
    secure: false,      // true only in production (HTTPS)
    expires: new Date(0),
  });

  return response;
}
