"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound, Sparkles } from "lucide-react";
import { endSession } from "@/lib/firebase/session";
import { useAccount } from "@/components/account/AccountProvider";
import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { PLANS } from "@/lib/plans";

export function AccountPanel({ onNavigate }: { onNavigate?: () => void }) {
  const account = useAccount();
  const syncError = useSavedOpportunitiesStore((s) => s.syncError);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  if (!account) return null;

  async function signOut() {
    setSigningOut(true);
    await endSession();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mx-3 mb-3 space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        <UserRound size={14} className="shrink-0 text-gray-400" />
        <span className="min-w-0 flex-1 truncate" title={account.email ?? undefined}>
          {account.name ?? account.email}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            account.plan === "pro" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {PLANS[account.plan].name}
        </span>
      </div>
      <div className="flex items-center justify-between">
        {account.plan === "free" ? (
          <Link
            href="/billing"
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <Sparkles size={13} /> Upgrade to Pro
          </Link>
        ) : (
          <span />
        )}
        <button
          onClick={signOut}
          disabled={signingOut}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-foreground disabled:opacity-60"
        >
          <LogOut size={13} /> {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
      {syncError && <p className="text-xs text-danger-700">{syncError}</p>}
    </div>
  );
}
