"use client";

import { ALL_CATEGORIES } from "@/lib/categories";
import { SORT_OPTIONS, type OpportunityFilters, type SortOption } from "./types";

const EXPERIENCE_OPTIONS = [
  { value: "any", label: "Any experience level" },
  { value: "no-experience", label: "No experience required" },
  { value: "entry", label: "Entry level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "experienced", label: "Experienced" },
] as const;

const DATE_OPTIONS = [
  { value: 0, label: "Any time" },
  { value: 1, label: "Last 24 hours" },
  { value: 3, label: "Last 3 days" },
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
];

interface FilterPanelProps {
  filters: OpportunityFilters;
  onChange: (patch: Partial<OpportunityFilters>) => void;
  onReset: () => void;
  countries: string[];
  cities: string[];
  sources: string[];
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-border bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

export function FilterPanel({ filters, onChange, onReset, countries, cities, sources }: FilterPanelProps) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div>
        <label className="text-xs font-medium text-muted">Keyword</label>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder="Search title, company, skill..."
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted">Country</label>
          <select
            value={filters.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted">City</label>
          <select
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted">Experience level</label>
        <select
          value={filters.experience}
          onChange={(e) => onChange({ experience: e.target.value as OpportunityFilters["experience"] })}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {EXPERIENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted">Date posted</label>
        <select
          value={filters.postedWithinDays}
          onChange={(e) => onChange({ postedWithinDays: Number(e.target.value) })}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {DATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted">Source website</label>
        <select
          value={filters.source}
          onChange={(e) => onChange({ source: e.target.value })}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted">Max startup cost</label>
          <span className="text-xs font-medium text-foreground">R{filters.maxStartupCost.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={20000}
          step={100}
          value={filters.maxStartupCost}
          onChange={(e) => onChange({ maxStartupCost: Number(e.target.value) })}
          className="mt-2 w-full accent-brand-600"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted">Min. trust score</label>
          <span className="text-xs font-medium text-foreground">{filters.minTrustScore}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minTrustScore}
          onChange={(e) => onChange({ minTrustScore: Number(e.target.value) })}
          className="mt-2 w-full accent-brand-600"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted">Quick filters</label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ToggleChip label="Remote only" active={filters.remoteOnly} onClick={() => onChange({ remoteOnly: !filters.remoteOnly })} />
          <ToggleChip label="Part-time" active={filters.partTime} onClick={() => onChange({ partTime: !filters.partTime })} />
          <ToggleChip label="Weekend" active={filters.weekend} onClick={() => onChange({ weekend: !filters.weekend })} />
          <ToggleChip label="Evening" active={filters.evening} onClick={() => onChange({ evening: !filters.evening })} />
          <ToggleChip label="Freelance" active={filters.freelance} onClick={() => onChange({ freelance: !filters.freelance })} />
          <ToggleChip label="Contract" active={filters.contract} onClick={() => onChange({ contract: !filters.contract })} />
          <ToggleChip
            label="Hide High Risk"
            active={filters.hideHighRisk}
            onClick={() => onChange({ hideHighRisk: !filters.hideHighRisk })}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted">Sort by</label>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortOption })}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg border border-border py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        Reset filters
      </button>
    </div>
  );
}
