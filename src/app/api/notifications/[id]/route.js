import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req, context) {
  await dbConnect();
  try {
    const params = await context.params;
    const { id } = params;

    const user = await getCurrentUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (notification.targetEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await notification.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
