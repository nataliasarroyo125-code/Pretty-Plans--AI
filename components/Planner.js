"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "@/components/Markdown";
import UpgradeButton from "@/components/UpgradeButton";

const TYPES = {
  event: {
    label: "🎉 Event",
    goal: "Ex: 21st birthday dinner for 8 friends",
    when: "Ex: Saturday, March 14",
    style: "Ex: pastel, cozy, Pinterest-y",
  },
  space: {
    label: "🛋️ Room / Space",
    goal: "Ex: Make my small dorm room feel cozy",
    when: "Ex: Before move-in on Aug 20",
    style: "Ex: warm neutrals, plants, boho",
  },
  schedule: {
    label: "📅 Schedule",
    goal: "Ex: Balance 15 credits, a part-time job, and the gym",
    when: "Ex: This week / finals week",
    style: "Ex: I focus best in the morning",
  },
};

export default function Planner({ initialPlans, isPro }) {
  const router = useRouter();
  const [kind, setKind] = useState("event");
  const [plans, setPlans] = useState(initialPlans);
  const [activeId, setActiveId] = useState(initialPlans[0]?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  const active = plans.find((p) => p.id === activeId);
  const t = TYPES[kind];

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setNeedsUpgrade(false);
    setLoading(true);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setNeedsUpgrade(Boolean(data.upgrade));
        return;
      }
      setPlans((prev) => [data.plan, ...prev]);
      setActiveId(data.plan.id);
      router.refresh(); // updates the "plans left" badge
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dash-grid">
      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 22 }}>Create a new plan</h2>
        <div className="tabs" role="group" aria-label="Plan type">
          {Object.entries(TYPES).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className="tab"
              aria-pressed={kind === key}
              onClick={() => setKind(key)}
            >
              {value.label}
            </button>
          ))}
        </div>
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="goal">What are you planning?</label>
            <input id="goal" name="goal" placeholder={t.goal} maxLength={200} required />
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="when">Date / timeframe</label>
              <input id="when" name="when" placeholder={t.when} maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="budget">Budget</label>
              <input id="budget" name="budget" placeholder="Ex: $150" maxLength={50} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="style">Style, vibe, or preferences</label>
            <input id="style" name="style" placeholder={t.style} maxLength={200} />
          </div>
          <div className="field">
            <label htmlFor="details">Anything else?</label>
            <textarea
              id="details"
              name="details"
              maxLength={1500}
              placeholder="Guests, room size, class times, must-haves, things to avoid…"
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? (<><span className="spinner" aria-hidden="true" />Creating your plan…</>) : "✦ Generate my plan"}
          </button>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {needsUpgrade && !isPro && <UpgradeButton />}
        </form>

        {plans.length > 0 && (
          <>
            <h3 style={{ marginTop: 28, fontSize: 17 }}>Your saved plans</h3>
            <ul className="plan-list">
              {plans.map((p) => (
                <li key={p.id}>
                  <button type="button" aria-current={p.id === activeId} onClick={() => setActiveId(p.id)}>
                    {p.title}
                    <span className="plan-meta">
                      {TYPES[p.kind]?.label ?? p.kind} · {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card" aria-live="polite">
        {loading ? (
          <div className="empty">
            <span className="spinner" aria-hidden="true" />
            <p>Designing your personalized plan… this takes about 10–30 seconds.</p>
          </div>
        ) : active ? (
          <>
            <span className="badge">{TYPES[active.kind]?.label ?? active.kind}</span>
            <h2 style={{ margin: "10px 0 0", fontSize: 24 }}>{active.title}</h2>
            <Markdown text={active.result} />
          </>
        ) : (
          <div className="empty">
            <div className="emoji" aria-hidden="true">✦</div>
            <h3>Your plan will appear here</h3>
            <p>Fill in the form and Pretty Plans AI will create a personalized plan with a budget and checklist.</p>
          </div>
        )}
      </div>
    </div>
  );
}
