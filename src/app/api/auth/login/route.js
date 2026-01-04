import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { verifyPassword, createToken } from "@/lib/auth";
import { getAuthCookieOptions } from "@/lib/cookie-options";

export const runtime = "nodejs";        // bcrypt, jwt
export const dynamic = "force-dynamic"; // cookies, req.json

export async function POST(req) {
  try {
    // 🔐 1️⃣ Guard: JWT_SECRET must exist on Vercel
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    // 🧾 2️⃣ Safe JSON parsing
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await dbConnect();

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
  id: String(user._id),
  email: user.email,
  name: user.name || "",
  avatar: user.avatar || null, // ✅ ADD THIS
},
      },
      { status: 200 }
    );

    // 🍪 3️⃣ Vercel-safe cookies
    const { name, cookieOptions } = getAuthCookieOptions();
    res.cookies.set(name, token, {
      ...cookieOptions,
      secure: true,      // REQUIRED on Vercel
      sameSite: "lax",   // safest default
    });

    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    // 🧠 4️⃣ TEMP: expose real error (remove later)
    return NextResponse.json(
      { error: err.message || "Server error" },
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
