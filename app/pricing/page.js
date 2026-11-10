import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import UpgradeButton from "@/components/UpgradeButton";

export const metadata = { title: "Pricing | Pretty Plans AI" };

export default async function PricingPage({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser().catch(() => null);

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="eyebrow">Pricing</div>
        <h1 style={{ fontSize: "clamp(32px,5vw,48px)" }}>Plan without limits</h1>
        <p className="lead">Start free. Upgrade once for unlimited AI plans — no subscription.</p>
        {params?.checkout === "cancelled" && (
          <div className="alert alert-info" style={{ maxWidth: 520, margin: "0 auto" }}>
            Checkout was cancelled — you have not been charged.
          </div>
        )}
      </section>
      <div className="grid-2" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="card pricing-card">
          <h3>Free</h3>
          <div className="price">$0</div>
          <ul className="checklist">
            <li>3 AI-generated plans</li>
            <li>Events, spaces, and schedules</li>
            <li>Plans saved to your account</li>
          </ul>
          {!user && <Link href="/signup" className="btn btn-outline">Create free account</Link>}
        </div>
        <div className="card pricing-card featured">
          <h3>Pro</h3>
          <div className="price">$9.99 <small>one-time</small></div>
          <ul className="checklist">
            <li>Unlimited AI plans</li>
            <li>Full plan history</li>
            <li>Priority access to new features</li>
          </ul>
          {user?.is_pro ? (
            <span className="badge badge-pro">You&apos;re on Pro ✓</span>
          ) : user ? (
            <UpgradeButton />
          ) : (
            <Link href="/signup" className="btn">Sign up to upgrade</Link>
          )}
          <p className="hint" style={{ marginTop: 14 }}>
            Secure payment by Stripe. Test mode: use card 4242 4242 4242 4242, any future date, any CVC.
          </p>
        </div>
      </div>
    </div>
  );
}
