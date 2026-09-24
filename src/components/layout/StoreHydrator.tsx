"use client";

import { useEffect } from "react";
import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { useSettingsStore } from "@/lib/store/settings";
import { useRefreshStore } from "@/lib/store/refresh";

/**
 * Persisted stores use `skipHydration` so their first client render matches
 * the server-rendered HTML exactly (no localStorage access during render).
 * This mounts once and pulls in the real persisted values right after,
 * which is a normal post-mount state update rather than a hydration
 * mismatch.
 */
export function StoreHydrator() {
  useEffect(() => {
    useSavedOpportunitiesStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    useRefreshStore.persist.rehydrate();
  }, []);

  return null;
}
