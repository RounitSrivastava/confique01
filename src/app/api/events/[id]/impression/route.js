// src/app/api/events/[id]/impression/route.js
import dbConnect from "@/lib/mongoose"; // Changed from { connectDB } to default import dbConnect
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  try {
    // ✅ Ensure database connection using the correct exported function name
    await dbConnect(); 
    
    const { id } = params;

    // 1. Validate ID format (Prevents crash if mock ID '1' is passed)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Event ID format" },
        { status: 400 }
      );
    }

    // 2. Increment impressions
    const event = await Event.findByIdAndUpdate(
      id,
      { $inc: { impressions: 1 } },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      impressions: event.impressions,
    });
  } catch (err) {
    console.error("❌ Impression Error:", err);
    return NextResponse.json(
      { error: "Failed to update impressions" },
      { status: 500 }
    );
  }
}