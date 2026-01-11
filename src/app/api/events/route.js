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

    /* ---------------------------------
       🔢 Normalize numbers (VERY IMPORTANT)
    ---------------------------------- */
    body.fixedPrice = Number(body.fixedPrice || 0);

    if (Array.isArray(body.ticketTypes)) {
      body.ticketTypes = body.ticketTypes.map((t) => ({
        name: t.name,
        price: Number(t.price),
      }));
    } else {
      body.ticketTypes = [];
    }

    /* ---------------------------------
       🧠 Server is the source of truth
    ---------------------------------- */

    // If fixed pricing
    if (body.pricingMode === "fixed" && body.fixedPrice > 0) {
      body.isFree = false;
    }

    // If flexible pricing
    if (body.pricingMode === "flexible" && body.ticketTypes.length > 0) {
      body.isFree = false;
    }

    // If event is free → wipe pricing
    if (body.isFree === true) {
      body.pricingMode = "free";
      body.fixedPrice = 0;
      body.ticketTypes = [];
    }

    /* ---------------------------------
       🔒 Validate pricing structure
    ---------------------------------- */

    if (body.isFree === false) {
      // Flexible pricing validation
      if (body.pricingMode === "flexible") {
        if (!Array.isArray(body.ticketTypes) || body.ticketTypes.length === 0) {
          return NextResponse.json(
            { error: "At least one ticket type is required." },
            { status: 400 }
          );
        }

        const invalid = body.ticketTypes.some(
          (t) => !t.name || typeof t.price !== "number" || t.price <= 0
        );

        if (invalid) {
          return NextResponse.json(
            { error: "Each ticket must have a valid name and price." },
            { status: 400 }
          );
        }
      }

      // Fixed pricing validation
      if (body.pricingMode === "fixed") {
        if (!body.fixedPrice || body.fixedPrice <= 0) {
          return NextResponse.json(
            { error: "Fixed price must be provided." },
            { status: 400 }
          );
        }
      }
    }

    /* ---------------------------------
       💾 Save event
    ---------------------------------- */
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
