import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await req.json(); // { userEmail, formData, paidRef }

    // 1️⃣ Validate event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Event ID" }, { status: 400 });
    }

    if (!body.userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    // 2️⃣ Prevent duplicate registration (same email)
    const alreadyRegistered = await Event.findOne({
      _id: id,
      "registrations.userEmail": body.userEmail,
    });

    if (alreadyRegistered) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    // 3️⃣ Save registration
    const event = await Event.findByIdAndUpdate(
      id,
      {
        $push: {
          registrations: {
            userEmail: body.userEmail,
            formData: body.formData || {},
            paidRef: body.paidRef || null,
            selectedTicketTypes: body.selectedTicketTypes || [],
            createdAt: new Date(),
          },
        },
        $inc: { registrationsCount: 1 },
      },
      { new: true, runValidators: true }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 4️⃣ Send registrations back (for multi-device frontend sync)
    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      registrationsCount: event.registrationsCount,
      registrations: event.registrations,   // 🔥 THIS enables multi-device detection
    });

  } catch (err) {
    console.error("❌ Registration API Error:", err);
    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}
