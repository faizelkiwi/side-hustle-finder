import { NextResponse, type NextRequest } from "next/server";
import { getSubscription, syncSubscription, verifyWebhook } from "@/lib/server/paypal";

// PayPal calls this when a subscription is activated, renewed, suspended
// (failed payment), cancelled or expires. Each event is verified with PayPal
// before anything is changed, and the subscription is re-fetched from PayPal
// so the stored state always reflects PayPal's latest view.
export async function POST(request: NextRequest) {
  const event = (await request.json().catch(() => null)) as {
    event_type?: string;
    resource?: { id?: string; billing_agreement_id?: string };
  } | null;
  if (!event?.event_type) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const verified = await verifyWebhook(request.headers, event).catch(() => false);
  if (!verified) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const subscriptionId = event.event_type.startsWith("BILLING.SUBSCRIPTION.")
    ? event.resource?.id
    : event.event_type === "PAYMENT.SALE.COMPLETED"
      ? event.resource?.billing_agreement_id
      : undefined;

  if (subscriptionId) {
    const subscription = await getSubscription(subscriptionId);
    // Ignore subscriptions this app didn't create (no user id attached).
    if (subscription.custom_id) await syncSubscription(subscription);
  }

  return NextResponse.json({ received: true });
}
