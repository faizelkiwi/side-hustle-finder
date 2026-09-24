"use client";

import { useMemo, useState } from "react";
import type { EnrichedOpportunity } from "@/lib/types";
import { isWithinDays } from "@/lib/format";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Inbox } from "lucide-react";

const BUCKETS = [
  { label: "Today", days: 1 },
  { label: "Last 24 Hours", days: 1 },
  { label: "Last 3 Days", days: 3 },
  { label: "Last 7 Days", days: 7 },
] as const;

export function DailyFeed({ opportunities }: { opportunities: EnrichedOpportunity[] }) {
  const [activeBucket, setActiveBucket] = useState<(typeof BUCKETS)[number]["label"]>("Today");

  const filtered = useMemo(() => {
    const days = BUCKETS.find((b) => b.label === activeBucket)?.days ?? 1;
    return opportunities
      .filter((o) => isWithinDays(o.dateDiscovered, days))
      .sort((a, b) => new Date(b.dateDiscovered).getTime() - new Date(a.dateDiscovered).getTime());
  }, [opportunities, activeBucket]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {BUCKETS.map((bucket) => (
          <button
            key={bucket.label}
            onClick={() => setActiveBucket(bucket.label)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeBucket === bucket.label
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-border bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {bucket.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing new in this window" description="Check back later or widen the time range." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}
