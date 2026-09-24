import type { SideHustleIdea } from "./types";
import { SIDE_HUSTLE_IDEAS } from "./data/sideHustleIdeas";

export interface BudgetInput {
  startupBudgetZAR: number;
  hoursPerWeek: number;
  desiredMonthlyIncomeZAR: number;
}

export interface BudgetMatch {
  idea: SideHustleIdea;
  fitsBudget: boolean;
  feasibilityNote: string;
}

/** Very rough top-of-range monthly estimate parsed from the idea's income range string. */
function parseUpperIncomeZAR(range: string): number {
  const matches = range.match(/R([\d,]+)/g);
  if (!matches || matches.length === 0) return 0;
  const numbers = matches.map((m) => Number(m.replace(/[R,]/g, "")));
  return Math.max(...numbers);
}

export function suggestForBudget(input: BudgetInput, limit = 8): BudgetMatch[] {
  const withinBudget = SIDE_HUSTLE_IDEAS.filter((idea) => idea.startupCostZAR[0] <= input.startupBudgetZAR);

  const scored = withinBudget.map((idea) => {
    const fitsBudget = idea.startupCostZAR[1] <= input.startupBudgetZAR;
    const upperIncome = parseUpperIncomeZAR(idea.incomeRangeZAR);

    let feasibilityNote: string;
    if (upperIncome === 0) {
      feasibilityNote = "Income is highly variable - treat as a long-term or supplementary hustle.";
    } else if (upperIncome >= input.desiredMonthlyIncomeZAR) {
      feasibilityNote = "Realistically capable of reaching your income goal at the upper end.";
    } else if (upperIncome >= input.desiredMonthlyIncomeZAR * 0.5) {
      feasibilityNote = "Could get you partway to your goal - consider combining with another hustle.";
    } else {
      feasibilityNote = "Likely to fall short of your monthly goal on its own.";
    }

    if (input.hoursPerWeek < 5) {
      feasibilityNote += " Limited hours available will stretch the timeline.";
    }

    return { idea, fitsBudget, feasibilityNote, upperIncome };
  });

  return scored
    .sort((a, b) => {
      if (a.fitsBudget !== b.fitsBudget) return a.fitsBudget ? -1 : 1;
      return b.upperIncome - a.upperIncome;
    })
    .slice(0, limit)
    .map(({ idea, fitsBudget, feasibilityNote }) => ({ idea, fitsBudget, feasibilityNote }));
}
