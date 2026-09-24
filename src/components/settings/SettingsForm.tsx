"use client";

import { useSettingsStore } from "@/lib/store/settings";
import type { Currency } from "@/lib/types";

const CURRENCIES: Currency[] = ["ZAR", "USD", "GBP", "EUR"];

const LOCATIONS = [
  "Remote Worldwide",
  "South Africa",
  "Cape Town",
  "Johannesburg",
  "Durban",
  "Pretoria",
];

export function SettingsForm() {
  const { currency, startupCostThresholdZAR, preferredLocation, update, reset } = useSettingsStore();

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Preferences</p>
        <p className="text-xs text-muted">Applies across the dashboard, filters, and budget tools.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted">Display currency</label>
          <select
            value={currency}
            onChange={(e) => update({ currency: e.target.value as Currency })}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted">Preferred location</label>
          <select
            value={preferredLocation}
            onChange={(e) => update({ preferredLocation: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted">
            Startup cost threshold (opportunities above this are marked High Cost and excluded by default)
          </label>
          <span className="text-xs font-semibold text-foreground">R{startupCostThresholdZAR.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={500}
          max={20000}
          step={500}
          value={startupCostThresholdZAR}
          onChange={(e) => update({ startupCostThresholdZAR: Number(e.target.value) })}
          className="mt-2 w-full accent-brand-600"
        />
      </div>

      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        Reset to defaults
      </button>
    </div>
  );
}
