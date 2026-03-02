import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    // 🔐 Verify Cashfree signature
    const signature = req.headers.get("x-cf-signature");

    const expected = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
      .update(rawBody)
      .digest("base64");

    if (signature !== expected) {
      console.error("❌ Invalid Cashfree signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("✅ Cashfree Webhook:", payload.type);
    console.log("FULL PAYLOAD:", payload);

    if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {

      // ✅ Correct paths
      const eventId = payload.data?.order?.order_tags?.eventId;
      const email = payload.data?.customer_details?.customer_email;
      const amount = payload.data?.order?.order_amount;
      const orderId = payload.data?.order?.order_id;

      console.log("eventId:", eventId);
      console.log("email:", email);

      if (!eventId || !email) {
        console.log("❌ Missing eventId/email");
        return NextResponse.json({ ok: true });
      }

      // 🔥 Auto-register
      const domain =
        process.env.DOMAIN || "http://localhost:3000";

      await fetch(`${domain}/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: email,
          paymentMethod: "gateway",
          orderId,
          formData: {
            paidAmount: amount,
          },
        }),
      });

      console.log("🎉 Registered:", email);
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}