import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  await dbConnect();
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const notifications = await Notification.find({ targetEmail: user.email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
      
    // Map to id format for frontend
    const formatted = notifications.map(n => ({
      ...n,
      id: n._id.toString()
    }));
      
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { targetEmail, type, message, postId, communitySlug, communityName } = body;
    
    if (!targetEmail || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    
    const notif = await Notification.create({
      targetEmail: targetEmail.toLowerCase(),
      type: type || "INFO",
      message,
      postId,
      communitySlug,
      communityName
    });
    
    return NextResponse.json({ success: true, notification: notif });
  } catch (error) {
    console.error("POST NOTIFICATION ERROR:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
