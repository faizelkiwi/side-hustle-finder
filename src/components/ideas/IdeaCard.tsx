import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { SideHustleIdea } from "@/lib/types";
import { CategoryBadge } from "@/components/ui/Badges";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";

export function IdeaCard({ idea }: { idea: SideHustleIdea }) {
  const [minCost, maxCost] = idea.startupCostZAR;
  const costLabel = minCost === 0 && maxCost === 0 ? "Free to start" : `R${minCost.toLocaleString()} - R${maxCost.toLocaleString()}`;

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap gap-1.5">
        <CategoryBadge category={idea.category} />
        <DifficultyBadge level={idea.difficulty} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{idea.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">{idea.description}</p>

      <div className="mt-3 space-y-1.5 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <MapPin size={13} />
          {idea.locationType} · {costLabel} to start
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          {idea.timeCommitment}
        </div>
      </div>

      <div className="mt-3 border-t border-border pt-3 text-xs font-medium text-foreground">
        Potential income: <span className="text-success-700">{idea.incomeRangeZAR}</span>
      </div>
    </Link>
  );
}
