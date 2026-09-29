import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { requireAccount } from "@/lib/server/session";
import { getSubscription, isBillingConfigured, syncSubscription } from "@/lib/server/paypal";
import { PLANS, type PlanId } from "@/lib/plans";
import { BillingActions } from "@/components/account/BillingActions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription_id?: string; canceled?: string; upgraded?: string }>;
}) {
  const params = await searchParams;
  const account = await requireAccount();

  // Returning from PayPal: confirm the subscription directly with PayPal so
  // Pro unlocks immediately, without waiting for the webhook. Only a
  // subscription created for this user (custom_id) is accepted.
  if (params.subscription_id && isBillingConfigured()) {
    const subscription = await getSubscription(params.subscription_id).catch(() => null);
    if (subscription?.custom_id === account.uid) await syncSubscription(subscription);
    redirect("/billing?upgraded=1");
  }

  const renews = account.currentPeriodEnd
    ? new Date(account.currentPeriodEnd).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Plan &amp; Billing</h1>
        <p className="text-sm text-muted">
          You&apos;re on the <span className="font-semibold text-foreground">{PLANS[account.plan].name}</span> plan
          {account.plan === "pro" && renews
            ? account.cancelAtPeriodEnd
              ? `, ending on ${renews}.`
              : `, renewing on ${renews}.`
            : "."}
        </p>
      </div>

      {params.upgraded && account.plan === "pro" && (
        <p className="rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700">
          Welcome to Pro! Your new features are unlocked.
        </p>
      )}
      {params.upgraded && account.plan !== "pro" && (
        <p className="rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700">
          We&apos;re still confirming your subscription with PayPal. Refresh this page in a moment.
        </p>
      )}
      {params.canceled && (
        <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
          You left PayPal before subscribing. You haven&apos;t been charged.
        </p>
      )}
      {account.subscriptionStatus === "suspended" && (
        <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          PayPal couldn&apos;t collect your last payment, so Pro is paused. Update your payment method in PayPal, or
          subscribe again below.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const plan = PLANS[id];
          const current = account.plan === id;
          return (
            <div
              key={id}
              className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm ${current ? "border-brand-500 ring-1 ring-brand-500" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                {current && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">Current plan</span>}
              </div>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <p className="mt-4">
                <span className="text-3xl font-semibold text-foreground">{plan.price}</span>{" "}
                <span className="text-sm text-muted">{plan.cadence}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-success-500" /> {f}
                  </li>
                ))}
              </ul>
              {id === "pro" && (
                <div className="mt-5">
                  <BillingActions
                    isPro={account.plan === "pro"}
                    hasActiveSubscription={account.subscriptionStatus === "active"}
                    billingEnabled={isBillingConfigured()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        Payments are processed securely by PayPal and billed in US dollars. We never see or store your card or
        PayPal details.
      </p>
    </div>
  );
}
