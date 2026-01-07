import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { verifyPassword, createToken } from "@/lib/auth";
import { getAuthCookieOptions } from "@/lib/cookie-options";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // 1. Validate environment
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters long");
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 2. Database Connection
    await dbConnect();
    
    // Use the safe model singleton pattern to avoid 500 errors in dev
    const UserModel = mongoose.models.User || User;

    const user = await UserModel.findOne({
      email: String(email).trim().toLowerCase(),
    })
      .select("+passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Verify Password
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. ✅ FIX: Await the asynchronous token creation
    const token = await createToken({
      userId: String(user._id),
      email: user.email,
      provider: "local",
    });

    const res = NextResponse.json(
      {
        ok: true,
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name || "",
          avatar: user.avatar || null,
        },
      },
      { status: 200 }
    );

    // 5. 🍪 Set Cookie
    const { name, cookieOptions } = getAuthCookieOptions();
    res.cookies.set(name, token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error("LOGIN API ERROR:", err.message);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}