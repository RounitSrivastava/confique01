// src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export const dynamic = "force-dynamic"; // ✅ REQUIRED in Next.js 15

export async function POST() {
  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );

  // 1. Get master cookie options
  const { name: primaryCookieName, cookieOptions: masterOptions } =
    getAuthCookieOptions();

  // 2. Deletion options (must MATCH original cookie options)
  const deleteOptions = {
    ...masterOptions,
    maxAge: 0,
    expires: new Date(0),
  };

  // 3. Clear primary auth cookie
  res.cookies.set(primaryCookieName, "", deleteOptions);

  // 4. Clear legacy cookies (safety)
  res.cookies.set("auth_token", "", deleteOptions);
  res.cookies.set("token", "", deleteOptions);

  return res;
}
