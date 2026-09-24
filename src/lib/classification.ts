import type { EnrichedOpportunity, Opportunity, RiskLevel, StartupCostTier } from "./types";

export function classifyStartupCost(costZAR: number): StartupCostTier {
  if (costZAR <= 0) return "Free to Start";
  if (costZAR <= 500) return "Very Low Cost";
  if (costZAR <= 2000) return "Low Cost";
  if (costZAR <= 5000) return "Moderate Cost";
  return "High Cost";
}

export function assessRisk(opportunity: Opportunity): RiskLevel {
  const signalCount = opportunity.scamSignals.length;
  if (signalCount === 0 && opportunity.trustScore >= 70) return "Low Risk";
  if (signalCount >= 3 || opportunity.trustScore < 35) return "High Risk";
  return "Review Carefully";
}

/**
 * 0-100 composite score. Deliberately weights startup cost and legitimacy
 * heavily so cheap, trustworthy opportunities aren't out-ranked by
 * expensive "business opportunities" with big earning claims.
 */
export function computeOpportunityScore(opportunity: Opportunity): number {
  const tier = classifyStartupCost(opportunity.startupCostZAR);
  const costScore: Record<StartupCostTier, number> = {
    "Free to Start": 100,
    "Very Low Cost": 85,
    "Low Cost": 65,
    "Moderate Cost": 40,
    "High Cost": 10,
  };

  const [minMonthly, maxMonthly] = opportunity.earningPotentialMonthlyZAR;
  const avgMonthly = (minMonthly + maxMonthly) / 2;
  // Diminishing returns above R25k/month so huge unverified claims don't dominate.
  const earningScore = Math.min(100, (avgMonthly / 25000) * 100);

  const flexibilityScore =
    (opportunity.partTime ? 25 : 0) +
    (opportunity.weekend || opportunity.evening ? 25 : 0) +
    (opportunity.workMode === "Remote" ? 30 : opportunity.workMode === "Hybrid" ? 15 : 0) +
    (opportunity.freelance || opportunity.contract ? 20 : 0);

  const legitimacyScore = Math.max(0, opportunity.trustScore - opportunity.scamSignals.length * 15);

  const experienceScore =
    opportunity.experienceLevel === "No Experience Required"
      ? 100
      : opportunity.experienceLevel === "Entry Level"
        ? 80
        : opportunity.experienceLevel === "Intermediate"
          ? 55
          : 35;

  const daysSincePosted = Math.max(
    0,
    (Date.now() - new Date(opportunity.datePosted).getTime()) / (1000 * 60 * 60 * 24),
  );
  const recencyScore = Math.max(0, 100 - daysSincePosted * 2.5);

  const activeScore = opportunity.isActive ? 100 : 0;

  const weighted =
    costScore[tier] * 0.22 +
    earningScore * 0.14 +
    flexibilityScore * 0.14 +
    legitimacyScore * 0.24 +
    experienceScore * 0.1 +
    recencyScore * 0.08 +
    activeScore * 0.08;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function enrichOpportunity(opportunity: Opportunity): EnrichedOpportunity {
  return {
    ...opportunity,
    startupCostTier: classifyStartupCost(opportunity.startupCostZAR),
    riskLevel: assessRisk(opportunity),
    opportunityScore: computeOpportunityScore(opportunity),
  };
}

export const STARTUP_COST_TIER_LABELS: Record<StartupCostTier, string> = {
  "Free to Start": "R0",
  "Very Low Cost": "R1 – R500",
  "Low Cost": "R501 – R2,000",
  "Moderate Cost": "R2,001 – R5,000",
  "High Cost": "Over R5,000",
};
