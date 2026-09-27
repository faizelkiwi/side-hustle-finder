import type { Opportunity } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Opportunities are considered duplicates when title + company + location
 * match, or when they share the exact source URL. When duplicates are
 * found, the one with the higher trust score (then most recently checked)
 * is kept as the primary listing.
 */
export function deduplicateOpportunities(opportunities: Opportunity[]): Opportunity[] {
  const groups = new Map<string, Opportunity[]>();

  for (const opp of opportunities) {
    const key = `${normalize(opp.title)}|${normalize(opp.company)}|${normalize(opp.city ?? opp.country)}`;
    const urlKey = `url:${normalize(opp.sourceUrl ?? "")}`;
    const existingKey = groups.has(key) ? key : groups.has(urlKey) ? urlKey : key;
    const bucket = groups.get(existingKey) ?? [];
    bucket.push(opp);
    groups.set(existingKey, bucket);
  }

  return Array.from(groups.values()).map((bucket) =>
    bucket.sort((a, b) => {
      if (b.trustScore !== a.trustScore) return b.trustScore - a.trustScore;
      return new Date(b.lastChecked).getTime() - new Date(a.lastChecked).getTime();
    })[0],
  );
}
