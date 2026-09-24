import clsx from "clsx";
import type { Difficulty } from "@/lib/types";

export function DifficultyBadge({ level }: { level: Difficulty }) {
  const classes: Record<Difficulty, string> = {
    Beginner: "bg-success-50 text-success-700 ring-success-500/20",
    Intermediate: "bg-warning-50 text-warning-700 ring-warning-500/20",
    Advanced: "bg-danger-50 text-danger-700 ring-danger-500/20",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", classes[level])}>
      {level}
    </span>
  );
}
