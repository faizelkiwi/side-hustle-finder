// Plan definitions shared by the landing page, billing page and feature gates.
// Prices are display copy; the amount actually charged comes from the PayPal
// plan configured in PAYPAL_PLAN_ID. PayPal doesn't support ZAR, so Pro is
// billed in US dollars.

export type PlanId = "free" | "pro";

export const FREE_SAVE_LIMIT = 10;

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: "R0",
    cadence: "forever",
    tagline: "Everything you need to start exploring.",
    features: [
      "Browse every opportunity and side hustle idea",
      "Scam-risk and opportunity scores",
      "Budget calculator",
      `Save up to ${FREE_SAVE_LIMIT} opportunities`,
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$5.99",
    cadence: "per month (USD)",
    tagline: "For serious side hustlers who want an edge.",
    features: [
      "Everything in Free",
      "Unlimited saved opportunities and tracking",
      "AI Opportunity Assistant",
      "Daily alerts feed",
      "Cancel anytime",
    ],
  },
};

/**
 * Whether a stored subscription unlocks Pro: an active PayPal subscription, or
 * a cancelled one that is still inside the period the user already paid for.
 */
export function isProSubscription(status: string | null, currentPeriodEnd: string | null, now = Date.now()): boolean {
  if (status === "active") return true;
  if (status === "cancelled" && currentPeriodEnd) return new Date(currentPeriodEnd).getTime() > now;
  return false;
}
