export type SortOption = "relevant" | "newest" | "lowest-cost" | "highest-income" | "highest-trust";

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
    sort: "relevant",
    ...overrides,
  };
}
