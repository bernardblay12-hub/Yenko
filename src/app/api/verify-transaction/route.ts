import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      // Mock verify in development if secret key is missing
      console.warn("PAYSTACK_SECRET_KEY is missing, falling back to mock verification.");
      return NextResponse.json({
        verified: true,
        plan: "Pro",
        reference,
        message: "Mock verified successfully (Development mode)"
      });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json({ error: data.message || "Failed to verify transaction" }, { status: 400 });
    }

    if (data.data.status !== "success") {
      return NextResponse.json({ error: `Transaction status is: ${data.data.status}` }, { status: 400 });
    }

    const plan = data.data.metadata?.plan || "Single Session credit";
    
    return NextResponse.json({
      verified: true,
      plan,
      amount: data.data.amount / 100, // Paystack amount is in pesewas
      currency: data.data.currency,
      email: data.data.customer?.email,
      reference,
    });
  } catch (error: any) {
    console.error("Error in verify-transaction API:", error);
    return NextResponse.json({ error: error.message || "Transaction verification failed" }, { status: 500 });
  }
}
