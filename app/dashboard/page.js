import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { FREE_PLAN_LIMIT, sql } from "@/lib/db";
import { fulfillCheckoutSession, getStripe } from "@/lib/stripe";
import Planner from "@/components/Planner";
import UpgradeButton from "@/components/UpgradeButton";

export const metadata = { title: "My Planner | Pretty Plans AI" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  let user = await getCurrentUser();
  if (!user) redirect("/login");

  // Returning from Stripe Checkout: verify the payment with Stripe on the server.
  let checkoutMessage = null;
  if (params?.checkout === "success" && typeof params.session_id === "string") {
    if (user.is_pro) {
      checkoutMessage = { type: "success", text: "Payment confirmed — welcome to Pro! 🎉" };
    } else {
      try {
        const session = await getStripe().checkout.sessions.retrieve(params.session_id);
        if (session.client_reference_id === String(user.id) && (await fulfillCheckoutSession(session))) {
          user = { ...user, is_pro: true };
          checkoutMessage = { type: "success", text: "Payment confirmed — welcome to Pro! 🎉" };
        } else {
          checkoutMessage = { type: "error", text: "We couldn't confirm that payment yet. Refresh in a moment." };
        }
      } catch (err) {
        console.error("Checkout verification failed", err);
        checkoutMessage = { type: "error", text: "We couldn't verify your payment. Please contact support." };
      }
    }
  }

  const plans = await sql`
    SELECT id, kind, title, result, created_at FROM plans
    WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 20`;
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM plans WHERE user_id = ${user.id}`;

  return (
    <div className="container dash">
      <div className="dash-head">
        <div>
          <h1>Hi{user.name ? `, ${user.name}` : ""} ✦</h1>
          <p style={{ margin: "4px 0 0" }}>
            {user.is_pro ? (
              <span className="badge badge-pro">Pro · Unlimited plans</span>
            ) : (
              <span className="badge">
                Free · {Math.max(0, FREE_PLAN_LIMIT - count)} of {FREE_PLAN_LIMIT} plans left
              </span>
            )}
          </p>
        </div>
        {!user.is_pro && <UpgradeButton />}
      </div>
      {checkoutMessage && (
        <div className={`alert alert-${checkoutMessage.type}`} style={{ marginBottom: 20 }}>
          {checkoutMessage.text}
        </div>
      )}
      <Planner
        initialPlans={plans.map((p) => ({ ...p, created_at: new Date(p.created_at).toISOString() }))}
        isPro={user.is_pro}
      />
    </div>
  );
}
