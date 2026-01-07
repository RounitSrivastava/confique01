import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options";
import { OAuth2Client } from "google-auth-library";

// ✅ Match your .env.local variable exactly
const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 🔐 Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, 
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const userPayload = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: "google",
    };

    const res = NextResponse.json({ ok: true, user: userPayload });
    const { name, cookieOptions } = getAuthCookieOptions();

    // 🍪 Set the cookie
    res.cookies.set(
      name,
      JSON.stringify(userPayload),
      {
        ...cookieOptions,
        // Ensure secure is true on the live site
        secure: process.env.NODE_ENV === "production",
      }
    );

    return res;
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}