"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Bookmark } from "lucide-react";
import type { EnrichedOpportunity, OpportunityStatus } from "@/lib/types";
import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { RiskBadge, ScoreBadge } from "@/components/ui/Badges";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeDate } from "@/lib/format";
import { useIsClient } from "@/lib/useIsClient";

const STATUS_TABS: (OpportunityStatus | "All")[] = [
  "All",
  "Interested",
  "Applied",
  "Interview",
  "Accepted",
  "Rejected",
  "Archived",
];

export function MyOpportunitiesBoard({ opportunities }: { opportunities: EnrichedOpportunity[] }) {
  const mounted = useIsClient();
  const saved = useSavedOpportunitiesStore((s) => s.saved);
  const setStatus = useSavedOpportunitiesStore((s) => s.setStatus);
  const remove = useSavedOpportunitiesStore((s) => s.remove);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");

  const opportunityMap = useMemo(() => new Map(opportunities.map((o) => [o.id, o])), [opportunities]);

  const savedItems = useMemo(() => {
    // Listings leave the live feeds when they close; those saves are still
    // shown (from the snapshot taken when saved) but without a link.
    return Object.values(saved)
      .map((meta) => ({ meta, opportunity: opportunityMap.get(meta.opportunityId) }))
      .sort((a, b) => new Date(b.meta.savedAt).getTime() - new Date(a.meta.savedAt).getTime());
  }, [saved, opportunityMap]);

  const filtered = activeTab === "All" ? savedItems : savedItems.filter((item) => item.meta.status === activeTab);

  if (!mounted) return null;

  if (savedItems.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No saved opportunities yet"
        description="Browse Find Opportunities and tap the bookmark icon to track opportunities you're interested in."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count = tab === "All" ? savedItems.length : savedItems.filter((i) => i.meta.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bookmark} title={`No opportunities marked "${activeTab}"`} description="Switch tabs or update an opportunity's status." />
      ) : (
        <div className="space-y-3">
          {filtered.map(({ meta, opportunity }) => (
            <div key={meta.opportunityId} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {opportunity ? (
                    <Link href={`/opportunities/${opportunity.id}`} className="text-sm font-semibold text-foreground hover:text-brand-600">
                      {opportunity.title}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-gray-500">{meta.snapshot?.title ?? "Listing no longer available"}</p>
                  )}
                  <p className="text-xs text-muted">
                    {opportunity?.company ?? meta.snapshot?.company ?? "Unknown company"}
                    {(opportunity?.sourceName ?? meta.snapshot?.sourceName) && ` · via ${opportunity?.sourceName ?? meta.snapshot?.sourceName}`}
                    {" "}· Saved {formatRelativeDate(meta.savedAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {opportunity ? (
                      <>
                        <RiskBadge level={opportunity.riskLevel} />
                        <ScoreBadge score={opportunity.opportunityScore} />
                      </>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        No longer listed - the job has closed or been filled
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={meta.status}
                    onChange={(e) => setStatus(meta.opportunityId, e.target.value as OpportunityStatus)}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {STATUS_TABS.slice(1).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(meta.opportunityId)}
                    aria-label="Remove from saved"
                    className="rounded-lg p-2 text-gray-400 hover:bg-danger-50 hover:text-danger-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {(meta.notes || meta.expectedEarnings || meta.actualEarnings) && (
                <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border pt-3 text-xs text-muted sm:grid-cols-3">
                  {meta.notes && (
                    <p className="sm:col-span-3">
                      <span className="font-medium text-foreground">Notes:</span> {meta.notes}
                    </p>
                  )}
                  {meta.expectedEarnings && (
                    <p>
                      <span className="font-medium text-foreground">Expected:</span> {meta.expectedEarnings}
                    </p>
                  )}
                  {meta.actualEarnings && (
                    <p>
                      <span className="font-medium text-foreground">Actual:</span> {meta.actualEarnings}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
