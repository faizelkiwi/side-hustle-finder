import { NextResponse } from "next/server";
import { requireAccount } from "@/lib/server/session";
import { cancelSubscription, getSubscription, isBillingConfigured, syncSubscription } from "@/lib/server/paypal";

// Cancels the user's PayPal subscription. They keep Pro until the end of the
// period they already paid for.
export async function POST() {
  const account = await requireAccount().catch(() => null);
  if (!account) return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  if (!isBillingConfigured()) return NextResponse.json({ error: "Billing isn't set up yet" }, { status: 503 });
  if (!account.paypalSubscriptionId || account.subscriptionStatus !== "active") {
    return NextResponse.json({ error: "You don't have an active subscription" }, { status: 400 });
  }

  try {
    await cancelSubscription(account.paypalSubscriptionId, "Cancelled by customer from Side Hustle Finder");
    await syncSubscription(await getSubscription(account.paypalSubscriptionId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Couldn't cancel with PayPal. Please try again." }, { status: 502 });
  }
}
