import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // 🔐 Verify Google token
  const googleRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );
  const googleUser = await googleRes.json();

  if (!googleUser.email) {
    return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
  }

  // 🧠 Map Google user → your user system
  const userPayload = {
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    provider: "google",
  };

  // 🍪 Create auth cookie (same as normal login)
  const res = NextResponse.json({ ok: true, user: userPayload });

  const { name, cookieOptions } = getAuthCookieOptions();

  res.cookies.set(
    name,
    JSON.stringify(userPayload),
    cookieOptions
  );

  return res;
}
