import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/cookie-options";
import { OAuth2Client } from "google-auth-library";
import { createToken } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect(); // 1. Connect to DB
    
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 2. 🔐 Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, 
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    // 3. 👤 Sync with MongoDB (Upsert)
    // We look for existing user by email, and update/create with Google info
    let user = await User.findOneAndUpdate(
      { email: payload.email },
      { 
        $set: { 
          name: payload.name, 
          avatar: payload.picture, 
          googleId: payload.sub,
          provider: "google" 
        } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 4. ✅ CREATE SIGNED JWT 
    // IMPORTANT: Use user._id.toString() (the MongoDB ID), NOT payload.sub
    const token = await createToken({
      userId: user._id.toString(), 
      email: user.email,
      provider: "google",
    });

    // 5. 🍪 Set the cookie
    const res = NextResponse.json({ 
      ok: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.avatar
      } 
    });

    const { name, cookieOptions } = getAuthCookieOptions();

    res.cookies.set(name, token, {
      ...cookieOptions,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("GOOGLE AUTH ROUTE ERROR:", error.message); 
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}