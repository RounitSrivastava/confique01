import crypto from "crypto";
import dbConnect from "../../../lib/dbConnect";
import Event from "../../../models/Event";
import User from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const msg = formData.get("msg");
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const email = searchParams.get("email");

    if (!msg) {
      console.error("❌ BillDesk Webhook: No msg in payload");
      return NextResponse.redirect(new URL("/events?payment_status=failed", req.url));
    }

    const secretKey = process.env.BILLDESK_SECRET_KEY || "testsecretkey";

    // BillDesk msg format: MerchantID|CustomerID|TxnReferenceNo|BankReferenceNo|TxnAmount|BankID|BankMerchantID|TxnType|CurrencyName|ItemCode|SecurityType|SecurityID|SecurityPassword|TxnDate|AuthStatus|SettlementType|AdditionalInfo1...|Checksum
    const parts = msg.split("|");
    const receivedChecksum = parts.pop();
    const messageWithoutChecksum = parts.join("|");

    // Re-calculate Checksum (HMAC-SHA256)
    const calculatedChecksum = crypto
      .createHmac("sha256", secretKey)
      .update(messageWithoutChecksum)
      .digest("hex")
      .toUpperCase();

    if (calculatedChecksum !== receivedChecksum) {
      console.error("❌ Invalid BillDesk signature");
      return NextResponse.redirect(new URL("/events?payment_status=failed", req.url));
    }

    const authStatus = parts[14]; // AuthStatus is at index 14
    if (authStatus !== "0300") {
      // 0300 indicates success
      console.error("❌ BillDesk Payment failed or pending. Status:", authStatus);
      return NextResponse.redirect(new URL("/events?payment_status=failed", req.url));
    }

    // Payment is successful! Update DB.
    await dbConnect();

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found for email:", email);
      return NextResponse.redirect(new URL("/events?payment_status=error", req.url));
    }

    // 2. Mark participant as PAID in the Event
    await Event.updateOne(
      { _id: eventId, "participants.userId": user._id },
      { $set: { "participants.$.paymentStatus": "PAID", "participants.$.status": "REGISTERED" } }
    );

    // Redirect user back to event page with success param
    return NextResponse.redirect(new URL(`/events?payment_status=success&event=${eventId}`, req.url));
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return NextResponse.redirect(new URL("/events?payment_status=error", req.url));
  }
}
