"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";

const PAYPAL_AUTOPAY_URL = "https://www.paypal.com/myaccount/autopay/";

export function BillingActions({
  isPro,
  hasActiveSubscription,
  billingEnabled,
}: {
  isPro: boolean;
  hasActiveSubscription: boolean;
  billingEnabled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!billingEnabled) {
    return <p className="text-sm text-muted">Upgrades will be available soon.</p>;
  }

  async function post(endpoint: string): Promise<{ url?: string }> {
    const res = await fetch(endpoint, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
    return data;
  }

  async function subscribe() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await post("/api/paypal/subscribe");
      if (!url) throw new Error("Couldn't reach PayPal. Please try again.");
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await post("/api/paypal/cancel");
      router.refresh();
      setConfirmingCancel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {hasActiveSubscription ? (
        confirmingCancel ? (
          <div className="space-y-2 rounded-lg border border-border bg-gray-50 p-3">
            <p className="text-sm text-gray-700">
              Cancel your Pro subscription? You&apos;ll keep Pro until the end of the period you&apos;ve paid for, and
              won&apos;t be charged again.
            </p>
            <div className="flex gap-2">
              <button
                onClick={cancel}
                disabled={busy}
                className="flex-1 rounded-lg bg-danger-500 px-3 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-60"
              >
                {busy ? "Cancelling..." : "Yes, cancel"}
              </button>
              <button
                onClick={() => setConfirmingCancel(false)}
                disabled={busy}
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep Pro
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingCancel(true)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel subscription
          </button>
        )
      ) : (
        <button
          onClick={subscribe}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ffc439] px-4 py-2.5 text-sm font-semibold text-[#111827] hover:brightness-95 disabled:opacity-60"
        >
          {busy ? "Opening PayPal..." : isPro ? "Resubscribe with PayPal" : "Subscribe with PayPal"}
        </button>
      )}
      <a
        href={PAYPAL_AUTOPAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 text-xs font-medium text-muted hover:text-foreground"
      >
        Manage payments in PayPal <ExternalLink size={11} />
      </a>
      {error && <p className="text-xs text-danger-700">{error}</p>}
    </div>
  );
}
