import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";

// PayPal Subscriptions via the REST API. PAYPAL_ENV=live switches from the
// sandbox to real payments; everything else is identical.

const BASE = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export const isBillingConfigured = () =>
  Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_PLAN_ID);

export interface PayPalSubscription {
  id: string;
  status: "APPROVAL_PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
  custom_id?: string;
  plan_id: string;
  billing_info?: { next_billing_time?: string; last_payment?: { time?: string } };
  links?: { href: string; rel: string }[];
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { authorization: `Basic ${credentials}`, "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function paypal<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      authorization: `Bearer ${await accessToken()}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw new Error(`PayPal ${init.method ?? "GET"} ${path} failed (${res.status}): ${await res.text()}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** Starts a subscription for this user and returns the PayPal approval URL to send them to. */
export async function createSubscription(opts: {
  uid: string;
  email: string | null;
  returnUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const subscription = await paypal<PayPalSubscription>("/v1/billing/subscriptions", {
    method: "POST",
    body: {
      plan_id: process.env.PAYPAL_PLAN_ID,
      custom_id: opts.uid,
      ...(opts.email ? { subscriber: { email_address: opts.email } } : {}),
      application_context: {
        brand_name: "Side Hustle Finder",
        user_action: "SUBSCRIBE_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
      },
    },
  });
  const approve = subscription.links?.find((l) => l.rel === "approve")?.href;
  if (!approve) throw new Error("PayPal did not return an approval link");
  return approve;
}

export const getSubscription = (id: string) =>
  paypal<PayPalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(id)}`);

export async function cancelSubscription(id: string, reason: string): Promise<void> {
  await paypal(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, { method: "POST", body: { reason } });
}

/** Asks PayPal to confirm a webhook really came from PayPal for our webhook ID. */
export async function verifyWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const result = await paypal<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: {
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event,
    },
  });
  return result.verification_status === "SUCCESS";
}

/**
 * Copies a subscription's state onto users/{uid} (uid comes from custom_id,
 * which only our server sets). The paid-through date is kept when PayPal drops
 * it after cancellation, so cancelled users keep Pro until the period ends.
 */
export async function syncSubscription(subscription: PayPalSubscription): Promise<void> {
  const uid = subscription.custom_id;
  if (!uid) throw new Error(`Subscription ${subscription.id} has no custom_id`);
  if (subscription.plan_id !== process.env.PAYPAL_PLAN_ID) throw new Error(`Subscription ${subscription.id} is for another plan`);
  const nextBilling = subscription.billing_info?.next_billing_time;
  await adminDb()
    .collection("users")
    .doc(uid)
    .set(
      {
        paypalSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status.toLowerCase(),
        ...(nextBilling ? { currentPeriodEnd: nextBilling } : {}),
        cancelAtPeriodEnd: subscription.status === "CANCELLED",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
