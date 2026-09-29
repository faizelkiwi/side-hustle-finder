"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import clsx from "clsx";
import type { EnrichedOpportunity } from "@/lib/types";
import { sortByPostedDate, type DateOrder } from "@/lib/format";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";

const PAGE_SIZE = 9;

const ORDERS: { value: DateOrder; label: string; icon: typeof ArrowDownWideNarrow }[] = [
  { value: "newest", label: "Newest first", icon: ArrowDownWideNarrow },
  { value: "oldest", label: "Oldest first", icon: ArrowUpNarrowWide },
];

/**
 * Every opportunity by date posted. Defaults to newest first on each page
 * load; the chosen order is kept when "Refresh Opportunities" re-fetches data.
 */
export function LatestOpportunities({ opportunities }: { opportunities: EnrichedOpportunity[] }) {
  const [order, setOrder] = useState<DateOrder>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sorted = useMemo(() => sortByPostedDate(opportunities, order), [opportunities, order]);
  const shown = sorted.slice(0, visible);

  return (
    <section aria-labelledby="latest-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="latest-heading" className="text-lg font-semibold text-foreground">
            Latest Opportunities
          </h2>
          <p className="text-sm text-muted">
            All {opportunities.length} opportunities by date posted, {order === "newest" ? "newest" : "oldest"} first
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div role="group" aria-label="Sort by date posted" className="inline-flex rounded-lg border border-border bg-white p-0.5 shadow-sm">
            {ORDERS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={order === value}
                onClick={() => {
                  setOrder(value);
                  setVisible(PAGE_SIZE);
                }}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  order === value ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          <Link href={`/opportunities?sort=${order}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>

      {visible < sorted.length && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Show more ({sorted.length - visible} remaining)
          </button>
        </div>
      )}
    </section>
  );
}
