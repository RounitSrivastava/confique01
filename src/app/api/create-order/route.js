import { Cashfree } from "cashfree-pg";

// Set credentials (v5 way)
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; 
// change to Cashfree.Environment.PRODUCTION after KYC

export async function POST(req) {
  try {
    const { amount, email } = await req.json();

    const orderRequest = {
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_email: email,
        customer_phone: "9999999999",
      },
    };

    // ✅ CORRECT v5 METHOD
    const response = await Cashfree.Orders.createOrder(
      "2023-08-01",
      orderRequest
    );

    return Response.json({
      order_id: response.data.order_id,
      payment_session_id: response.data.payment_session_id,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err.response?.data || err);
    return Response.json(
      { error: err.response?.data || err.message },
      { status: 500 }
    );
  }
}