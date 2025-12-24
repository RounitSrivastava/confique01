// src/app/api/events/[id]/register/route.js
import dbConnect from "@/lib/mongoose"; // Changed from { connectDB } to default import dbConnect
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  try {
    // ✅ Use the correct exported function name
    await dbConnect(); 
    
    const { id } = params;
    const body = await req.json(); // This contains { userEmail, formData, paidRef }

    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Event ID" }, { status: 400 });
    }

    // 2. Optional: Check if user already registered
    if (body.userEmail) {
      const existingEvent = await Event.findOne({
        _id: id,
        "registrations.userEmail": body.userEmail,
      });
      if (existingEvent) {
        return NextResponse.json(
          { error: "You are already registered for this event" },
          { status: 400 }
        );
      }
    }

    // 3. Update the event
    const event = await Event.findByIdAndUpdate(
      id,
      {
        $push: { registrations: body },
        $inc: { registrationsCount: 1 },
      },
      { new: true, runValidators: true }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      registrationsCount: event.registrationsCount,
      message: "Registration successful!",
    });
  } catch (err) {
    console.error("❌ Registration API Error:", err);
    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}