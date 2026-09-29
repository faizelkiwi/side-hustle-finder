"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";

/** Log in / Get started for visitors; Go to dashboard for signed-in users. */
export function HeaderActions() {
  const signedIn = useAuthStore((s) => s.status === "signedIn");

  if (signedIn) {
    return (
      <Link href="/dashboard" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
        Go to dashboard
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
        Log in
      </Link>
      <Link href="/signup" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
        Get started
      </Link>
    </div>
  );
}
