import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, PRO_PRICE_CENTS } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first.", login: true }, { status: 401 });
  if (user.is_pro) return NextResponse.json({ url: "/dashboard" });

  const origin = new URL(request.url).origin;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRO_PRICE_CENTS,
            product_data: {
              name: "Pretty Plans Pro",
              description: "Unlimited AI plans for events, spaces, and schedules.",
            },
          },
        },
      ],
      customer_email: user.email,
      client_reference_id: String(user.id),
      metadata: { userId: String(user.id) },
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error", err);
    return NextResponse.json({ error: "Checkout is unavailable right now. Please try again." }, { status: 502 });
  }
}
