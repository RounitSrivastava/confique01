// src/app/api/events/[id]/route.js
import dbConnect from "@/lib/mongoose"; 
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



// ✅ GET: Fetch a single event by ID
export async function GET(req, { params }) {
  try {
    await dbConnect(); 
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Event ID format" }, { status: 400 });
    }

    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json(event);
  } catch (err) {
    console.error("❌ Single Event Fetch Error:", err);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

// ✅ PATCH: Update an existing event (Used for Editing)
export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Event ID format" }, { status: 400 });
    }

    // Update the event with the data sent from the HostEventPage
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true } // Returns the new document and checks schema rules
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEvent);
  } catch (err) {
    console.error("❌ Event Update Error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// ✅ DELETE: Remove an event (Used for the Delete button in Profile)
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Event ID format" }, { status: 400 });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("❌ Event Delete Error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}