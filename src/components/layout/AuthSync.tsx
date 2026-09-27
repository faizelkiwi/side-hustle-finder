"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { fetchSavedOpportunities, upsertSavedOpportunities } from "@/lib/firebase/savedOpportunities";
import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { useAuthStore } from "@/lib/store/auth";

/**
 * Keeps the saved-opportunities store in step with the signed-in Firebase
 * account. On sign-in, the account's saves are loaded and anything saved in
 * this browser while signed out is uploaded, so nothing is lost. On sign-out
 * the previous user's saves are cleared from this browser.
 */
export function AuthSync() {
  useEffect(() => {
    const auth = getFirebaseAuth();
    const { setAuth } = useAuthStore.getState();
    if (!auth) {
      setAuth("disabled");
      return;
    }

    let loadingFor: string | null = null;

    async function loadAccount(userId: string) {
      if (loadingFor === userId) return;
      loadingFor = userId;
      const store = useSavedOpportunitiesStore;
      try {
        if (!store.persist.hasHydrated()) await store.persist.rehydrate();
        const { saved: local, userId: localOwner } = store.getState();
        const remote = await fetchSavedOpportunities(userId);

        // Local saves made while signed out get added to the account. A cache
        // belonging to the same account is ignored in favour of the database,
        // so removals made on another device are respected.
        const toUpload = localOwner === null ? Object.values(local).filter((m) => !remote[m.opportunityId]) : [];
        await upsertSavedOpportunities(userId, toUpload);

        const merged = { ...remote };
        for (const meta of toUpload) merged[meta.opportunityId] = meta;
        store.getState().loadAccount(userId, merged);
      } catch {
        store.getState().setSyncError("Couldn't load your saved opportunities. Refresh the page to try again.");
        loadingFor = null;
      }
    }

    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuth("signedOut");
        loadingFor = null;
        if (useSavedOpportunitiesStore.getState().userId) {
          useSavedOpportunitiesStore.getState().clearAccount();
        }
        return;
      }
      setAuth("signedIn", user.email);
      void loadAccount(user.uid);
    });
  }, []);

  return null;
}
