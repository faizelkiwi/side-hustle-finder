import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isProSubscription, type PlanId } from "@/lib/plans";
import { adminAuth, adminDb } from "./firebaseAdmin";

// Data access layer for the signed-in user. Every protected page calls
// requireUser()/requireAccount() itself rather than relying on the layout,
// because layouts don't re-run on client navigation.

export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days, Firebase's maximum

export interface SessionUser {
  uid: string;
  email: string | null;
  name: string | null;
}

export interface Account extends SessionUser {
  plan: PlanId;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paypalSubscriptionId: string | null;
}

/** The verified user for this request, or null when there is no valid session cookie. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null, name: (decoded.name as string | undefined) ?? null };
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** The signed-in user plus their plan, read from users/{uid} (written only by the server). */
export const requireAccount = cache(async (): Promise<Account> => {
  const user = await requireUser();
  const snapshot = await adminDb().collection("users").doc(user.uid).get();
  const data = snapshot.data() ?? {};
  const status = typeof data.subscriptionStatus === "string" ? data.subscriptionStatus : null;
  const currentPeriodEnd = typeof data.currentPeriodEnd === "string" ? data.currentPeriodEnd : null;
  return {
    ...user,
    plan: isProSubscription(status, currentPeriodEnd) ? "pro" : "free",
    subscriptionStatus: status,
    currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
    paypalSubscriptionId: typeof data.paypalSubscriptionId === "string" ? data.paypalSubscriptionId : null,
  };
});
