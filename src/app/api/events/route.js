// src/app/api/events/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose"; // Changed from { connectDB } to default import dbConnect
import Event from "@/models/Event";
export const dynamic = "force-dynamic";


/* CREATE EVENT */
export async function POST(req) {
  try {
    // Ensure database connection using the correct exported function name
    await dbConnect(); 
    
    const body = await req.json();

    // The data coming from HostEventPage now contains Cloudinary URLs
    const event = await Event.create({
      ...body,
      impressions:
        Math.floor(Math.random() * (3500 - 1200 + 1)) + 1200,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("❌ Mongoose Save Error:", err);

    // Return the specific Mongoose error (like "Banner is required") 
    // so the frontend alert is actually helpful.
    return NextResponse.json(
      { error: err.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

/* GET ALL EVENTS */
export async function GET() {
  try {
    await dbConnect();
    
    // Sort by impressions descending so popular events appear first
    const events = await Event.find().sort({ impressions: -1 });
    
    return NextResponse.json(events);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}