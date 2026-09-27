"use client";

import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuthStore } from "@/lib/store/auth";
import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";

export function AccountPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { status, email } = useAuthStore();
  const syncError = useSavedOpportunitiesStore((s) => s.syncError);

  if (status === "disabled" || status === "loading") return null;

  return (
    <div className="mx-3 mb-3 rounded-lg border border-border p-3">
      {status === "signedIn" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted">
            <UserRound size={14} className="shrink-0 text-gray-400" />
            <span className="truncate" title={email ?? undefined}>
              {email}
            </span>
          </div>
          <button
            onClick={() => {
              const auth = getFirebaseAuth();
              if (auth) void signOut(auth);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-foreground"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <LogIn size={16} /> Sign in to sync your saves
        </Link>
      )}
      {syncError && <p className="mt-2 text-xs text-danger-700">{syncError}</p>}
    </div>
  );
}
