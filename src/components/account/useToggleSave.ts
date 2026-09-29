"use client";

import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { FREE_SAVE_LIMIT } from "@/lib/plans";
import { useAccount } from "./AccountProvider";

/**
 * Save/unsave for one opportunity, respecting the Free plan's save limit.
 * `limitReached` is true when saving this one would exceed the limit.
 */
export function useToggleSave(opportunityId: string) {
  const account = useAccount();
  const isSaved = useSavedOpportunitiesStore((s) => s.isSaved(opportunityId));
  const savedCount = useSavedOpportunitiesStore((s) => Object.keys(s.saved).length);
  const toggleSave = useSavedOpportunitiesStore((s) => s.toggleSave);
  const limitReached = account?.plan !== "pro" && !isSaved && savedCount >= FREE_SAVE_LIMIT;

  return {
    isSaved,
    limitReached,
    toggle: () => {
      if (limitReached) return;
      toggleSave(opportunityId);
    },
  };
}
