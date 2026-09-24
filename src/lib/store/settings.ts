"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings } from "../types";

interface SettingsState extends AppSettings {
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: "ZAR",
  startupCostThresholdZAR: 5000,
  preferredLocation: "Remote Worldwide",
  notifyEmail: false,
  notifyWhatsApp: false,
  notifyBrowser: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set((state) => ({ ...state, ...patch })),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    { name: "shf-settings", skipHydration: true },
  ),
);

export const CURRENCY_RATES_FROM_ZAR: Record<AppSettings["currency"], number> = {
  ZAR: 1,
  USD: 0.055,
  GBP: 0.043,
  EUR: 0.05,
};

export const CURRENCY_SYMBOLS: Record<AppSettings["currency"], string> = {
  ZAR: "R",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

export function formatCurrencyFromZAR(amountZAR: number, currency: AppSettings["currency"]): string {
  const converted = amountZAR * CURRENCY_RATES_FROM_ZAR[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
