"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OpportunityStatus, SavedOpportunityMeta } from "../types";

interface SavedOpportunitiesState {
  saved: Record<string, SavedOpportunityMeta>;
  isSaved: (opportunityId: string) => boolean;
  toggleSave: (opportunityId: string) => void;
  updateMeta: (opportunityId: string, patch: Partial<SavedOpportunityMeta>) => void;
  setStatus: (opportunityId: string, status: OpportunityStatus) => void;
  remove: (opportunityId: string) => void;
}

function defaultMeta(opportunityId: string): SavedOpportunityMeta {
  return {
    opportunityId,
    savedAt: new Date().toISOString(),
    status: "Interested",
    notes: "",
    applicationDate: null,
    expectedEarnings: "",
    actualEarnings: "",
  };
}

export const useSavedOpportunitiesStore = create<SavedOpportunitiesState>()(
  persist(
    (set, get) => ({
      saved: {},
      isSaved: (opportunityId) => Boolean(get().saved[opportunityId]),
      toggleSave: (opportunityId) =>
        set((state) => {
          const next = { ...state.saved };
          if (next[opportunityId]) {
            delete next[opportunityId];
          } else {
            next[opportunityId] = defaultMeta(opportunityId);
          }
          return { saved: next };
        }),
      updateMeta: (opportunityId, patch) =>
        set((state) => {
          const existing = state.saved[opportunityId] ?? defaultMeta(opportunityId);
          return {
            saved: { ...state.saved, [opportunityId]: { ...existing, ...patch } },
          };
        }),
      setStatus: (opportunityId, status) =>
        set((state) => {
          const existing = state.saved[opportunityId] ?? defaultMeta(opportunityId);
          const applicationDate =
            status === "Applied" && !existing.applicationDate
              ? new Date().toISOString()
              : existing.applicationDate;
          return {
            saved: { ...state.saved, [opportunityId]: { ...existing, status, applicationDate } },
          };
        }),
      remove: (opportunityId) =>
        set((state) => {
          const next = { ...state.saved };
          delete next[opportunityId];
          return { saved: next };
        }),
    }),
    { name: "shf-saved-opportunities", skipHydration: true },
  ),
);
