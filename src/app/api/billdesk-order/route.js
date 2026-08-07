import crypto from "crypto";

export async function POST(req) {
  try {
    const { amount, email, eventId } = await req.json();

    const merchantId = process.env.BILLDESK_MERCHANT_ID || "TESTMERCHANT";
    const securityId = process.env.BILLDESK_SECURITY_ID || "testsecid";
    const secretKey = process.env.BILLDESK_SECRET_KEY || "testsecretkey";
    
    // Check if we are in production or test
    const isProd = process.env.NODE_ENV === "production";
    const actionUrl = isProd 
      ? "https://pgi.billdesk.com/pgidsk/PGIMerchantPayment" 
      : "https://uat.billdesk.com/pgidsk/PGIMerchantPayment";

    // Create a unique order ID
    const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // The Return URL that BillDesk will POST the response to
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/api/billdesk-webhook?eventId=${eventId}&email=${encodeURIComponent(email)}`;

    // Build the pipe-separated string for BillDesk standard integration
    // Format: MerchantID|CustomerID|NA|TxnAmount|NA|NA|NA|CurrencyType|NA|TypeField1|SecurityID|NA|NA|TypeField2|NA|NA|NA|NA|NA|NA|NA|ReturnURL
    const strBuilder = [
      merchantId,
      orderId,       // CustomerID / OrderID
      "NA",
      amount.toFixed(2), // TxnAmount
      "NA", "NA", "NA",
      "INR",         // CurrencyType
      "NA",
      "R",           // TypeField1 (R = Retail)
      securityId,    // SecurityID
      "NA", "NA",
      "F",           // TypeField2
      "NA", "NA", "NA", "NA", "NA", "NA", "NA",
      returnUrl
    ];

    const message = strBuilder.join("|");

    // Generate Checksum (HMAC-SHA256)
    const checksum = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("hex")
      .toUpperCase();

    // Final payload string
    const finalMessage = `${message}|${checksum}`;

    return Response.json({
      actionUrl,
      msg: finalMessage,
      orderId,
    });
  } catch (err) {
    console.error("CREATE BILLDESK ORDER ERROR:", err);
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
