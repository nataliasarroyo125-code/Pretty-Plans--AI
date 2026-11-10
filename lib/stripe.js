import Stripe from "stripe";
import { sql } from "@/lib/db";

export const PRO_PRICE_CENTS = 999;

let stripe;
export function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set.");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/**
 * Upgrades the user tied to a paid Checkout Session. Safe to call more than once
 * (from both the success redirect and the webhook).
 */
export async function fulfillCheckoutSession(session) {
  if (session.payment_status !== "paid") return false;
  const userId = Number(session.client_reference_id);
  if (!Number.isInteger(userId)) return false;
  await sql`UPDATE users SET is_pro = TRUE, stripe_session_id = ${session.id} WHERE id = ${userId}`;
  return true;
}
