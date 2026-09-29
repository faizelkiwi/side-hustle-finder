import type { EnrichedOpportunity } from "@/lib/types";
import { isWithinDays, sortByPostedDate } from "@/lib/format";
import type { OpportunityFilters } from "./types";

const EXPERIENCE_MAP: Record<Exclude<OpportunityFilters["experience"], "any">, string> = {
  "no-experience": "No Experience Required",
  entry: "Entry Level",
  intermediate: "Intermediate",
  experienced: "Experienced",
};

export function applyFilters(opportunities: EnrichedOpportunity[], filters: OpportunityFilters): EnrichedOpportunity[] {
  const keyword = filters.keyword.trim().toLowerCase();

  let result = opportunities.filter((o) => {
    if (keyword) {
      const haystack = `${o.title} ${o.company} ${o.description} ${o.skills.join(" ")}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    if (filters.category !== "all" && o.category !== filters.category) return false;
    if (filters.country !== "all" && o.country !== filters.country) return false;
    if (filters.city !== "all" && o.city !== filters.city) return false;
    if (filters.source !== "all" && o.sourceName !== filters.source) return false;
    if (filters.experience !== "any" && o.experienceLevel !== EXPERIENCE_MAP[filters.experience]) return false;
    if (filters.postedWithinDays > 0 && !isWithinDays(o.datePosted, filters.postedWithinDays)) return false;
    if (o.startupCostZAR > filters.maxStartupCost) return false;
    if (o.trustScore < filters.minTrustScore) return false;
    if (filters.remoteOnly && o.workMode !== "Remote") return false;
    if (filters.partTime && !o.partTime) return false;
    if (filters.weekend && !o.weekend) return false;
    if (filters.evening && !o.evening) return false;
    if (filters.freelance && !o.freelance) return false;
    if (filters.contract && !o.contract) return false;
    if (filters.hideHighRisk && o.riskLevel === "High Risk") return false;
    return true;
  });

  if (filters.sort === "newest" || filters.sort === "oldest") {
    return sortByPostedDate(result, filters.sort);
  }

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "lowest-cost":
        return a.startupCostZAR - b.startupCostZAR;
      case "highest-income":
        return b.earningPotentialMonthlyZAR[1] - a.earningPotentialMonthlyZAR[1];
      case "highest-trust":
        return b.trustScore - a.trustScore;
      case "relevant":
      default:
        return b.opportunityScore - a.opportunityScore;
    }
  });

  return result;
}
