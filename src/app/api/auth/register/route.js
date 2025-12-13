// src/app/api/auth/register/route.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, createToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing name/email/password" }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash: hashed,
    });

    const token = createToken({ userId: String(user._id), email: user.email });

    const res = NextResponse.json(
      { user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );

    // Use centralized cookie options so set/clear always match
    const { name: cookieName, cookieOptions } = getAuthCookieOptions();

    res.cookies.set(cookieName, token, cookieOptions);

    return res;
  } catch (err) {
    console.error("REGISTER ROUTE ERROR:", err);
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      { error: isDev ? String(err.message || err) : "Server error" },
      { status: 500 }
    );
  }
}
