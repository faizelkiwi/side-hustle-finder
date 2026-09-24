import type { OpportunityCategory, SideHustleIdea } from "./types";
import { SIDE_HUSTLE_IDEAS } from "./data/sideHustleIdeas";

export interface AssistantProfile {
  skills: string;
  experience: string;
  hoursPerWeek: number;
  workType: "Any" | "Online" | "Local";
  desiredMonthlyIncomeZAR: number;
  maxStartupBudgetZAR: number;
  location: string;
  interests: string;
}

export interface AssistantRecommendation {
  idea: SideHustleIdea;
  matchScore: number;
  reasons: string[];
}

const STOPWORDS = new Set(["and", "the", "with", "for", "a", "of", "in", "to", "on", "my"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function recommendSideHustles(profile: AssistantProfile, limit = 6): AssistantRecommendation[] {
  const profileTokens = new Set([
    ...tokenize(profile.skills),
    ...tokenize(profile.experience),
    ...tokenize(profile.interests),
  ]);

  const results: AssistantRecommendation[] = SIDE_HUSTLE_IDEAS.map((idea) => {
    let score = 0;
    const reasons: string[] = [];

    const ideaTokens = new Set([
      ...tokenize(idea.title),
      ...tokenize(idea.description),
      ...idea.skillsRequired.flatMap(tokenize),
      ...tokenize(idea.category),
    ]);
    const overlap = [...profileTokens].filter((t) => ideaTokens.has(t));
    if (overlap.length > 0) {
      score += overlap.length * 18;
      reasons.push(`Matches your background in ${overlap.slice(0, 3).join(", ")}`);
    }

    const [minCost, maxCost] = idea.startupCostZAR;
    if (maxCost <= profile.maxStartupBudgetZAR) {
      score += 20;
      reasons.push(`Fits within your R${profile.maxStartupBudgetZAR.toLocaleString()} startup budget`);
    } else if (minCost <= profile.maxStartupBudgetZAR) {
      score += 8;
      reasons.push("Partially within your budget - entry point may cost more than your stated maximum");
    } else {
      score -= 15;
    }

    if (profile.workType !== "Any") {
      if (idea.locationType === profile.workType || idea.locationType === "Both") {
        score += 15;
        reasons.push(`Available ${profile.workType.toLowerCase()}, matching your preference`);
      } else {
        score -= 10;
      }
    }

    if (profile.hoursPerWeek <= 5 && /flexible|any time|short bursts|spare time/i.test(idea.timeCommitment)) {
      score += 10;
      reasons.push("Flexible time commitment suits your limited weekly hours");
    } else if (profile.hoursPerWeek >= 10) {
      score += 5;
    }

    if (idea.difficulty === "Beginner") {
      score += 6;
    }

    return { idea, matchScore: Math.max(0, Math.round(score)), reasons: reasons.slice(0, 3) };
  });

  return results
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function recommendedCategories(recommendations: AssistantRecommendation[]): OpportunityCategory[] {
  const seen = new Set<OpportunityCategory>();
  for (const r of recommendations) {
    seen.add(r.idea.category);
  }
  return Array.from(seen);
}
