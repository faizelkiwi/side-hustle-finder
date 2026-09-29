"use client";

import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { FREE_SAVE_LIMIT } from "@/lib/plans";
import type { Opportunity } from "@/lib/types";
import { useAccount } from "./AccountProvider";

/**
 * Save/unsave for one opportunity, respecting the Free plan's save limit.
 * `limitReached` is true when saving this one would exceed the limit. A small
 * snapshot is stored so the save still makes sense after the live listing closes.
 */
export function useToggleSave(opportunity: Pick<Opportunity, "id" | "title" | "company" | "sourceName">) {
  const account = useAccount();
  const isSaved = useSavedOpportunitiesStore((s) => s.isSaved(opportunity.id));
  const savedCount = useSavedOpportunitiesStore((s) => Object.keys(s.saved).length);
  const toggleSave = useSavedOpportunitiesStore((s) => s.toggleSave);
  const limitReached = account?.plan !== "pro" && !isSaved && savedCount >= FREE_SAVE_LIMIT;

  return {
    isSaved,
    limitReached,
    toggle: () => {
      if (limitReached) return;
      toggleSave(opportunity.id, { title: opportunity.title, company: opportunity.company, sourceName: opportunity.sourceName });
    },
  };
}
