"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RefreshState {
  lastRefreshedAt: string | null;
  markRefreshed: () => void;
}

export const useRefreshStore = create<RefreshState>()(
  persist(
    (set) => ({
      lastRefreshedAt: null,
      markRefreshed: () => set({ lastRefreshedAt: new Date().toISOString() }),
    }),
    { name: "shf-last-refresh", skipHydration: true },
  ),
);
