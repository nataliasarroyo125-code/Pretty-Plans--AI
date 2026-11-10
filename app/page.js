import Link from "next/link";

const features = [
  {
    emoji: "📅",
    title: "Organize your schedule",
    text: "Balance classes, study blocks, work shifts, and self-care with a weekly plan built around your real deadlines.",
  },
  {
    emoji: "🎉",
    title: "Plan an event",
    text: "Birthdays, club socials, game nights, and trips — get themes, budget breakdowns, shopping lists, and a day-by-day checklist.",
  },
  {
    emoji: "🛋️",
    title: "Style your space",
    text: "Turn a dorm, bedroom, or first apartment into a space you love with color palettes, renter-friendly decor, and a shopping plan.",
  },
];

export default function Home() {
  return (
    <div className="container">
      <section className="hero">
        <div className="eyebrow">Your creativity, beautifully organized</div>
        <h1>Your Vision.<br />Beautifully Planned.</h1>
        <p className="lead">
          Pretty Plans AI is a personalized AI planning app for students and young adults. Tell it what
          you&apos;re planning, your budget, and your style — and get a clear, practical plan in seconds.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn">Start planning free</Link>
          <Link href="/login" className="btn btn-outline">Log in</Link>
        </div>
        <p className="hero-note">3 free AI plans · No credit card required</p>
      </section>

      <section id="features">
        <h2 className="section-title">Three ways to make life pretty</h2>
        <p className="section-sub">One planner for the busy, creative parts of student life.</p>
        <div className="grid-3">
          {features.map((f) => (
            <article className="card" key={f.title}>
              <div className="emoji" aria-hidden="true">{f.emoji}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="how">
          <h2 className="section-title">How it works</h2>
          <div className="grid-3" style={{ marginTop: 24 }}>
            <div>
              <div className="step-num">01 — Tell us your vision</div>
              <p>Pick a schedule, an event, or a space to design.</p>
            </div>
            <div>
              <div className="step-num">02 — Share your preferences</div>
              <p>Add your budget, timeline, style, and any must-haves.</p>
            </div>
            <div>
              <div className="step-num">03 — Get your personalized plan</div>
              <p>Receive an AI-crafted plan with a budget breakdown and checklist, saved to your account.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <h2 className="section-title">Simple pricing</h2>
        <p className="section-sub">Try it free, then unlock unlimited planning with a one-time upgrade.</p>
        <div className="grid-2" style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="card pricing-card">
            <h3>Free</h3>
            <div className="price">$0</div>
            <ul className="checklist">
              <li>3 AI-generated plans</li>
              <li>Events, spaces, and schedules</li>
              <li>Plans saved to your account</li>
            </ul>
            <Link href="/signup" className="btn btn-outline">Create free account</Link>
          </div>
          <div className="card pricing-card featured">
            <h3>Pro</h3>
            <div className="price">$9.99 <small>one-time</small></div>
            <ul className="checklist">
              <li>Unlimited AI plans</li>
              <li>Full plan history</li>
              <li>Priority access to new features</li>
            </ul>
            <Link href="/pricing" className="btn">Upgrade to Pro</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="cta-band">
          <h2 className="section-title">Ready to plan something pretty?</h2>
          <p className="section-sub">Join free and create your first plan in under a minute.</p>
          <Link href="/signup" className="btn">Get started</Link>
        </div>
      </section>
    </div>
  );
}
