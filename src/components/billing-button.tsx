"use client";
import { useState } from "react";
export default function BillingButton({
  portal = false,
  disabled = false,
}: {
  portal?: boolean;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function open() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/billing/${portal ? "portal" : "checkout"}`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok || !data.url)
        throw new Error(data.error || "Could not open billing.");
      const url = new URL(data.url);
      if (
        url.protocol !== "https:" ||
        !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname)
      )
        throw new Error("Unexpected checkout address.");
      window.location.assign(url.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect.");
      setBusy(false);
    }
  }
  return (
    <>
      <button className="button" disabled={disabled || busy} onClick={open}>
        {busy
          ? "Opening Stripe…"
          : portal
            ? "Manage subscription"
            : disabled
              ? "Checkout coming soon"
              : "Upgrade with Stripe"}
      </button>
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
    </>
  );
}
