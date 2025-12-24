// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import { verifyPassword, createToken } from "@/lib/auth";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export const runtime = "nodejs";        // ✅ REQUIRED (bcrypt, mongoose, jwt)
export const dynamic = "force-dynamic"; // ✅ REQUIRED (req.json, cookies)

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    })
      .select("+passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "No user found" },
        { status: 404 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = createToken({
      userId: String(user._id),
      email: user.email,
    });

    const res = NextResponse.json(
      {
        ok: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name || "",
        },
      },
      { status: 200 }
    );

    const { name, cookieOptions } = getAuthCookieOptions();
    res.cookies.set(name, token, cookieOptions);

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
    { error: "Method not allowed" },
    { status: 405 }
  );
}
