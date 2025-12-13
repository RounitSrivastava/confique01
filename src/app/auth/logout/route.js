// src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options"; // 🔑 IMPORT MASTER OPTIONS

export async function POST() {
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });

  // 1. Get master cookie options (includes name, path, secure, sameSite, httpOnly)
  const { name: primaryCookieName, cookieOptions: masterOptions } = getAuthCookieOptions();

  // 2. Create deletion-specific options by spreading master options
  const deleteOptions = {
    ...masterOptions,
    // Overwrite MaxAge and Expires for deletion
    maxAge: 0, 
    expires: new Date(0), // fallback for strict browsers
  };

  // The secure flag must be retrieved from masterOptions for accurate logging
  const secureFlag = masterOptions.secure;

  // 3. Clear the real auth cookie
  res.cookies.set(primaryCookieName, "", deleteOptions);

  // 4. Clear legacy cookies (if they still exist) using the same consistent options
  res.cookies.set("auth_token", "", deleteOptions);
  res.cookies.set("token", "", deleteOptions);

  console.log("LOGOUT → cookies cleared (secure =", secureFlag, ")");
  return res;
}