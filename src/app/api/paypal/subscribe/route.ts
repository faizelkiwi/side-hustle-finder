import { NextResponse, type NextRequest } from "next/server";
import { requireAccount } from "@/lib/server/session";
import { createSubscription, isBillingConfigured } from "@/lib/server/paypal";

// Starts a PayPal subscription for the Pro plan and returns the approval URL.
export async function POST(request: NextRequest) {
  const account = await requireAccount().catch(() => null);
  if (!account) return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  if (!isBillingConfigured()) return NextResponse.json({ error: "Billing isn't set up yet" }, { status: 503 });
  if (account.plan === "pro" && account.subscriptionStatus === "active") {
    return NextResponse.json({ error: "You're already on Pro" }, { status: 409 });
  }

  const origin = request.nextUrl.origin;
  try {
    const url = await createSubscription({
      uid: account.uid,
      email: account.email,
      // PayPal appends ?subscription_id=... to the return URL.
      returnUrl: `${origin}/billing`,
      cancelUrl: `${origin}/billing?canceled=1`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Couldn't reach PayPal. Please try again." }, { status: 502 });
  }
}
