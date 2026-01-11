import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* CREATE EVENT */
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    // -------------------------------
    // 🔒 VALIDATE PAYMENT STRUCTURE
    // -------------------------------

    if (body.isFree === false) {

      // Flexible pricing
      if (body.pricingMode === "flexible") {
        if (!Array.isArray(body.ticketTypes) || body.ticketTypes.length === 0) {
          return NextResponse.json(
            { error: "At least one ticket type is required." },
            { status: 400 }
          );
        }

        const invalid = body.ticketTypes.some(
          t => !t.name || typeof t.price !== "number" || t.price <= 0
        );

        if (invalid) {
          return NextResponse.json(
            { error: "Each ticket must have a valid name and price." },
            { status: 400 }
          );
        }
      }

      // Fixed pricing
      if (body.pricingMode === "fixed") {
        if (!body.fixedPrice || body.fixedPrice <= 0) {
          return NextResponse.json(
            { error: "Fixed price must be provided." },
            { status: 400 }
          );
        }
      }
    }

    // -------------------------------
    // SAVE EVENT
    // -------------------------------
    const event = await Event.create({
      ...body,
      impressions: Math.floor(Math.random() * (3500 - 1200 + 1)) + 1200,
    });

    return NextResponse.json(event, { status: 201 });

  } catch (err) {
    console.error("❌ Mongoose Save Error:", err);
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
