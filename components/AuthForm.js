"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {isSignup && (
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" autoComplete="name" maxLength={80} />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 8 : undefined}
          required
        />
        {isSignup && <span className="hint">At least 8 characters.</span>}
      </div>
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
      </button>
      <p className="hint" style={{ textAlign: "center" }}>
        {isSignup ? (
          <>Already have an account? <Link href="/login">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
