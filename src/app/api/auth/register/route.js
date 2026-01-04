// src/app/api/auth/register/route.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, createToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing name/email/password" },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

// ✅ DEFAULT AVATAR (FIX)
const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
  name || normalizedEmail
)}`;

const user = await User.create({
  name: String(name).trim(),
  email: normalizedEmail,
  passwordHash: hashedPassword,
  avatar: defaultAvatar, // 🔥 IMPORTANT
});

    const token = createToken({
      userId: String(user._id),
      email: user.email,
    });

    const res = NextResponse.json(
      {
        ok: true,
       user: {
  id: String(user._id),
  name: user.name,
  email: user.email,
  avatar: user.avatar, // ✅ ADD THIS
},
      },
      { status: 201 }
    );

    const { name: cookieName, cookieOptions } = getAuthCookieOptions();
    res.cookies.set(cookieName, token, cookieOptions);

    return res;
  } catch (err) {
    console.error("REGISTER ROUTE ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
