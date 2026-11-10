import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { fulfillCheckoutSession, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured." }, { status: 501 });

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("Invalid Stripe signature", err.message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await ensureDb();
    await fulfillCheckoutSession(event.data.object);
  }
  return NextResponse.json({ received: true });
}
