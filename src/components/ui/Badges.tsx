import clsx from "clsx";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import type { RiskLevel, StartupCostTier } from "@/lib/types";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<RiskLevel, { classes: string; Icon: typeof ShieldCheck }> = {
    "Low Risk": { classes: "bg-success-50 text-success-700 ring-success-500/20", Icon: ShieldCheck },
    "Review Carefully": { classes: "bg-warning-50 text-warning-700 ring-warning-500/20", Icon: ShieldQuestion },
    "High Risk": { classes: "bg-danger-50 text-danger-700 ring-danger-500/20", Icon: ShieldAlert },
  };
  const { classes, Icon } = config[level];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        classes,
      )}
    >
      <Icon size={13} />
      {level}
    </span>
  );
}

export function CostTierBadge({ tier }: { tier: StartupCostTier }) {
  const classes: Record<StartupCostTier, string> = {
    "Free to Start": "bg-success-50 text-success-700 ring-success-500/20",
    "Very Low Cost": "bg-brand-50 text-brand-700 ring-brand-500/20",
    "Low Cost": "bg-blue-50 text-blue-700 ring-blue-500/20",
    "Moderate Cost": "bg-warning-50 text-warning-700 ring-warning-500/20",
    "High Cost": "bg-danger-50 text-danger-700 ring-danger-500/20",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        classes[tier],
      )}
    >
      {tier}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const classes =
    score >= 75
      ? "bg-success-50 text-success-700 ring-success-500/20"
      : score >= 50
        ? "bg-brand-50 text-brand-700 ring-brand-500/20"
        : "bg-gray-100 text-gray-600 ring-gray-400/20";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        classes,
      )}
    >
      Score {score}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-300/40">
      {category}
    </span>
  );
}
