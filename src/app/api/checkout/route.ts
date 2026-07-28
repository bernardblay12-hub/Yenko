import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, email, amount } = body;

    // Amount should be in pesewas for GHS (multiply by 100)
    // Convert USD to GHS (assuming $1 = 15 GHS for demo purposes)
    const exchangeRate = 15;
    const amountInGHS = amount * exchangeRate;
    const paystackAmount = Math.round(amountInGHS * 100);

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || 'user@example.com', // Replace with user email in production
        amount: paystackAmount,
        currency: 'GHS',
        metadata: {
          plan,
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/workspace`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
