// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import { verifyPassword, createToken } from "@/lib/auth";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export const dynamic = "force-dynamic"; // ✅ REQUIRED

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createToken({
      userId: String(user._id),
      email: user.email,
    });

    const publicUser = {
      id: String(user._id),
      email: user.email,
      name: user.name || "",
    };

    const res = NextResponse.json(
      { ok: true, user: publicUser },
      { status: 200 }
    );

    const { name: cookieName, cookieOptions } = getAuthCookieOptions();
    res.cookies.set(cookieName, token, cookieOptions);

    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
