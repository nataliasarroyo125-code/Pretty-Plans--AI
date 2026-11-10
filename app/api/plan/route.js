import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser } from "@/lib/auth";
import { FREE_PLAN_LIMIT, sql } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";

const KINDS = {
  event: "an event (party, celebration, club meeting, trip, or get-together)",
  space: "a room or living space (dorm, bedroom, apartment, study corner)",
  schedule: "a personal schedule (classes, study time, work shifts, deadlines, self-care)",
};

const SYSTEM_PROMPT = `You are Pretty Plans AI, a warm, practical planning assistant for college students and young adults.
You create personalized plans for events, room/space design, and weekly schedules.
Write in clear Markdown using "##" section headings, short bullet lists, and **bold** for key items. No tables.
Always respect the stated budget: give realistic US price estimates and a budget breakdown that adds up to no more than the budget.
Favor affordable, student-friendly, renter-friendly ideas (nothing that damages walls or breaks dorm rules).
Structure every plan as: a one-line summary, the core plan, a budget breakdown (when a budget applies), a step-by-step checklist with timing, and 2–3 "make it pretty" finishing touches.
Keep the whole plan under about 600 words.`;

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

let anthropic;
function getClient() {
  if (!anthropic) anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY on the server only
  return anthropic;
}

async function generatePlan(userPrompt) {
  const client = getClient();
  const request = {
    model: MODEL,
    max_tokens: 8000,
    output_config: { effort: "low" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  };
  try {
    // Server-side fallback: if a safety classifier declines, the API retries on a fallback model.
    return await client.beta.messages.create({
      ...request,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
  } catch (err) {
    // If this account doesn't have the fallback beta, fall back to a plain request.
    if (err instanceof Anthropic.BadRequestError) {
      return await client.messages.create(request);
    }
    throw err;
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const plans = await sql`
    SELECT id, kind, title, result, created_at FROM plans
    WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 20`;
  return NextResponse.json({ plans });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to create a plan." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kind = clean(body.kind, 20);
  if (!KINDS[kind]) return NextResponse.json({ error: "Choose a plan type." }, { status: 400 });

  const input = {
    goal: clean(body.goal, 200),
    when: clean(body.when, 100),
    budget: clean(body.budget, 50),
    style: clean(body.style, 200),
    details: clean(body.details, 1500),
  };
  if (!input.goal) {
    return NextResponse.json({ error: "Tell us what you're planning." }, { status: 400 });
  }

  if (!user.is_pro) {
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM plans WHERE user_id = ${user.id}`;
    if (count >= FREE_PLAN_LIMIT) {
      return NextResponse.json(
        { error: `You've used your ${FREE_PLAN_LIMIT} free plans. Upgrade to Pro for unlimited plans.`, upgrade: true },
        { status: 402 }
      );
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "The AI planner isn't configured yet (missing API key)." }, { status: 503 });
  }

  const userPrompt = [
    `Please create a personalized plan for ${KINDS[kind]}.`,
    `What I'm planning: ${input.goal}`,
    input.when && `Date / timeframe: ${input.when}`,
    input.budget && `Budget: ${input.budget}`,
    input.style && `Style, vibe, or preferences: ${input.style}`,
    input.details && `Other details: ${input.details}`,
  ]
    .filter(Boolean)
    .join("\n");

  let message;
  try {
    message = await generatePlan(userPrompt);
  } catch (err) {
    console.error("Claude API error", err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "The AI service key is invalid. Please contact support." }, { status: 503 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "The AI planner is busy. Please try again in a minute." }, { status: 429 });
    }
    return NextResponse.json({ error: "The AI planner had a problem. Please try again." }, { status: 502 });
  }

  if (message.stop_reason === "refusal") {
    return NextResponse.json(
      { error: "Sorry, we can't help with that request. Try rephrasing your plan." },
      { status: 422 }
    );
  }

  const result = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!result) {
    return NextResponse.json({ error: "The AI returned an empty plan. Please try again." }, { status: 502 });
  }

  const title = input.goal.slice(0, 120);
  const [plan] = await sql`
    INSERT INTO plans (user_id, kind, title, input, result)
    VALUES (${user.id}, ${kind}, ${title}, ${JSON.stringify(input)}, ${result})
    RETURNING id, kind, title, result, created_at`;

  return NextResponse.json({ plan });
}
