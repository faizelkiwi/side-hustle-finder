"use client";

import { signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "./client";

/** Turns the browser's Firebase sign-in into the server's httpOnly session cookie. */
export async function establishSession(user: User): Promise<void> {
  ending = false;
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(error ?? "Couldn't start your session");
  }
}

let ending = false;

/** True while endSession() is running, so <SessionGuard /> doesn't treat an intentional sign-out as a mismatch. */
export const isEndingSession = () => ending;

/** Signs out of both Firebase (browser) and the server session. */
export async function endSession(): Promise<void> {
  ending = true;
  await fetch("/api/session", { method: "DELETE" }).catch(() => undefined);
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}
