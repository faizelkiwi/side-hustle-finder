"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { endSession, isEndingSession } from "@/lib/firebase/session";

/**
 * Keeps the server session and the browser's Firebase sign-in in agreement.
 * If this browser is signed out of Firebase (or signed in as someone else)
 * while the server cookie is still valid, both are cleared and the user is
 * sent to log in again, so saves always sync to the right account.
 */
export function SessionGuard({ serverUid }: { serverUid: string }) {
  const status = useAuthStore((s) => s.status);
  const uid = useAuthStore((s) => s.uid);

  useEffect(() => {
    const mismatch = status === "signedOut" || (status === "signedIn" && uid !== serverUid);
    if (!mismatch || isEndingSession()) return;
    const next = window.location.pathname + window.location.search;
    void endSession().finally(() => window.location.replace(`/login?next=${encodeURIComponent(next)}`));
  }, [status, uid, serverUid]);

  return null;
}
