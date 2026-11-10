"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeButton({ label = "Upgrade to Pro — $9.99", className = "btn" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/signup");
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className={className} onClick={startCheckout} disabled={loading}>
        {loading ? "Opening secure checkout…" : label}
      </button>
      {error && <div className="alert alert-error" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}
