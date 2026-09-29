"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OpportunityStatus, SavedOpportunityMeta, SavedOpportunitySnapshot } from "../types";
import { deleteSavedOpportunity, upsertSavedOpportunities } from "../firebase/savedOpportunities";

interface SavedOpportunitiesState {
  saved: Record<string, SavedOpportunityMeta>;
  /** Signed-in user whose account `saved` mirrors; null means saves live in this browser only. */
  userId: string | null;
  syncError: string | null;
  isSaved: (opportunityId: string) => boolean;
  toggleSave: (opportunityId: string, snapshot?: SavedOpportunitySnapshot) => void;
  updateMeta: (opportunityId: string, patch: Partial<SavedOpportunityMeta>) => void;
  setStatus: (opportunityId: string, status: OpportunityStatus) => void;
  remove: (opportunityId: string) => void;
  /** Replaces local state with the signed-in user's saved opportunities. */
  loadAccount: (userId: string, saved: Record<string, SavedOpportunityMeta>) => void;
  /** Clears the previous user's saves from this browser after sign-out. */
  clearAccount: () => void;
  setSyncError: (message: string | null) => void;
}

function defaultMeta(opportunityId: string, snapshot?: SavedOpportunitySnapshot): SavedOpportunityMeta {
  return {
    opportunityId,
    // Firestore rejects undefined fields, so only include the snapshot when there is one.
    ...(snapshot ? { snapshot } : {}),
    savedAt: new Date().toISOString(),
    status: "Interested",
    notes: "",
    applicationDate: null,
    expectedEarnings: "",
    actualEarnings: "",
  };
}

const SYNC_ERROR = "Couldn't save your last change to your account. Check your connection and try again.";
const UPSERT_DELAY_MS = 600;
const pendingUpserts = new Map<string, ReturnType<typeof setTimeout>>();

export const useSavedOpportunitiesStore = create<SavedOpportunitiesState>()(
  persist(
    (set, get) => {
      // Mirrors a local change to Firestore when signed in. Upserts are debounced
      // per opportunity so typing in the earnings/notes fields doesn't send a
      // request per keystroke; the latest local value is what gets written.
      const syncUpsert = (opportunityId: string) => {
        const { userId } = get();
        if (!userId) return;
        clearTimeout(pendingUpserts.get(opportunityId));
        pendingUpserts.set(
          opportunityId,
          setTimeout(() => {
            pendingUpserts.delete(opportunityId);
            const meta = get().saved[opportunityId];
            if (!meta || get().userId !== userId) return;
            upsertSavedOpportunities(userId, [meta]).then(
              () => set({ syncError: null }),
              () => set({ syncError: SYNC_ERROR }),
            );
          }, UPSERT_DELAY_MS),
        );
      };

      const syncDelete = (opportunityId: string) => {
        const { userId } = get();
        if (!userId) return;
        clearTimeout(pendingUpserts.get(opportunityId));
        pendingUpserts.delete(opportunityId);
        deleteSavedOpportunity(userId, opportunityId).then(
          () => set({ syncError: null }),
          () => set({ syncError: SYNC_ERROR }),
        );
      };

      return {
        saved: {},
        userId: null,
        syncError: null,
        isSaved: (opportunityId) => Boolean(get().saved[opportunityId]),
        toggleSave: (opportunityId, snapshot) => {
          const wasSaved = Boolean(get().saved[opportunityId]);
          set((state) => {
            const next = { ...state.saved };
            if (wasSaved) {
              delete next[opportunityId];
            } else {
              next[opportunityId] = defaultMeta(opportunityId, snapshot);
            }
            return { saved: next };
          });
          if (wasSaved) syncDelete(opportunityId);
          else syncUpsert(opportunityId);
        },
        updateMeta: (opportunityId, patch) => {
          set((state) => {
            const existing = state.saved[opportunityId] ?? defaultMeta(opportunityId);
            return {
              saved: { ...state.saved, [opportunityId]: { ...existing, ...patch } },
            };
          });
          syncUpsert(opportunityId);
        },
        setStatus: (opportunityId, status) => {
          set((state) => {
            const existing = state.saved[opportunityId] ?? defaultMeta(opportunityId);
            const applicationDate =
              status === "Applied" && !existing.applicationDate
                ? new Date().toISOString()
                : existing.applicationDate;
            return {
              saved: { ...state.saved, [opportunityId]: { ...existing, status, applicationDate } },
            };
          });
          syncUpsert(opportunityId);
        },
        remove: (opportunityId) => {
          set((state) => {
            const next = { ...state.saved };
            delete next[opportunityId];
            return { saved: next };
          });
          syncDelete(opportunityId);
        },
        loadAccount: (userId, saved) => set({ userId, saved, syncError: null }),
        clearAccount: () => {
          pendingUpserts.forEach(clearTimeout);
          pendingUpserts.clear();
          set({ userId: null, saved: {}, syncError: null });
        },
        setSyncError: (message) => set({ syncError: message }),
      };
    },
    {
      name: "shf-saved-opportunities",
      skipHydration: true,
      partialize: (state) => ({ saved: state.saved, userId: state.userId }),
    },
  ),
);
