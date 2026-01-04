import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store" };

export async function GET(req) {
  await dbConnect();

  try {
    // optional: require auth
    const actor = await getCurrentUser(req);
    if (!actor?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400, headers: HEADERS }
      );
    }

    const user = await User.findOne({ email })
      .select("name email username avatar bio location website")
      .lean();

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 404, headers: HEADERS }
      );
    }

    return NextResponse.json(
      {
        user: {
          displayName: user.name || user.username,
          email: user.email,
          avatar: user.avatar || null,
          bio: user.bio || "",
          location: user.location || "",
          website: user.website || "",
        },
      },
      { status: 200, headers: HEADERS }
    );
  } catch (err) {
    console.error("USER BY EMAIL ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: HEADERS }
    );
  }
}
