export type SortOption = "relevant" | "newest" | "oldest" | "lowest-cost" | "highest-income" | "highest-trust";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "relevant", label: "Most relevant" },
  { value: "lowest-cost", label: "Lowest startup cost" },
  { value: "highest-income", label: "Highest estimated income" },
  { value: "highest-trust", label: "Highest trust score" },
];

export const isSortOption = (value: string | null): value is SortOption =>
  SORT_OPTIONS.some((o) => o.value === value);

export interface OpportunityFilters {
  keyword: string;
  category: string;
  country: string;
  city: string;
  source: string;
  experience: "any" | "no-experience" | "entry" | "intermediate" | "experienced";
  postedWithinDays: number;
  maxStartupCost: number;
  minTrustScore: number;
  remoteOnly: boolean;
  partTime: boolean;
  weekend: boolean;
  evening: boolean;
  freelance: boolean;
  contract: boolean;
  hideHighRisk: boolean;
  sort: SortOption;
}

export function defaultFilters(overrides?: Partial<OpportunityFilters>): OpportunityFilters {
  return {
    keyword: "",
    category: "all",
    country: "all",
    city: "all",
    source: "all",
    experience: "any",
    postedWithinDays: 0,
    maxStartupCost: 10000,
    minTrustScore: 0,
    remoteOnly: false,
    partTime: false,
    weekend: false,
    evening: false,
    freelance: false,
    contract: false,
    hideHighRisk: false,
    sort: "newest",
    ...overrides,
  };
}
