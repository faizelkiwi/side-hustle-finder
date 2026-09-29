// One-time PayPal setup: creates the Pro product, a monthly USD billing plan
// and the webhook, then prints the env vars to add to Vercel / .env.local.
//
// Usage (reads PAYPAL_ENV, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET from the environment):
//   node scripts/paypal-setup.mjs https://your-site.example/api/paypal/webhook [price=5.99]
// Run once for sandbox and once again with PAYPAL_ENV=live when launching.

const [webhookUrl, price = "5.99"] = process.argv.slice(2);
const { PAYPAL_ENV = "sandbox", PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
if (!webhookUrl || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error("Usage: PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... node scripts/paypal-setup.mjs <webhookUrl> [price]");
  process.exit(1);
}
const BASE = PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function api(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      authorization: path.startsWith("/v1/oauth2")
        ? `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`
        : `Bearer ${token}`,
      "content-type": path.startsWith("/v1/oauth2") ? "application/x-www-form-urlencoded" : "application/json",
      prefer: "return=representation",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path} failed (${res.status}): ${JSON.stringify(data)}`);
  return data;
}

let token = "";
token = (await api("/v1/oauth2/token", "grant_type=client_credentials")).access_token;

const product = await api("/v1/catalogs/products", {
  name: "Side Hustle Finder Pro",
  description: "Unlimited saves, AI Opportunity Assistant and daily alerts.",
  type: "SERVICE",
  category: "SOFTWARE",
});

const plan = await api("/v1/billing/plans", {
  product_id: product.id,
  name: "Pro Monthly",
  description: `Side Hustle Finder Pro, $${price} per month`,
  status: "ACTIVE",
  billing_cycles: [
    {
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: { fixed_price: { value: price, currency_code: "USD" } },
    },
  ],
  payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 1 },
});

const webhook = await api("/v1/notifications/webhooks", {
  url: webhookUrl,
  event_types: [
    "BILLING.SUBSCRIPTION.ACTIVATED",
    "BILLING.SUBSCRIPTION.UPDATED",
    "BILLING.SUBSCRIPTION.CANCELLED",
    "BILLING.SUBSCRIPTION.SUSPENDED",
    "BILLING.SUBSCRIPTION.EXPIRED",
    "BILLING.SUBSCRIPTION.RE-ACTIVATED",
    "PAYMENT.SALE.COMPLETED",
  ].map((name) => ({ name })),
});

console.log(`PAYPAL_ENV=${PAYPAL_ENV}`);
console.log(`PAYPAL_PLAN_ID=${plan.id}`);
console.log(`PAYPAL_WEBHOOK_ID=${webhook.id}`);
