"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, SearchX, X } from "lucide-react";
import type { EnrichedOpportunity } from "@/lib/types";
import { useSettingsStore } from "@/lib/store/settings";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { FilterPanel } from "@/components/opportunities/FilterPanel";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { applyFilters } from "./applyFilters";
import { defaultFilters, type SortOption } from "./types";

const PAGE_SIZE = 9;

export function OpportunityExplorer({ opportunities }: { opportunities: EnrichedOpportunity[] }) {
  const searchParams = useSearchParams();
  const initialSort = (searchParams.get("sort") as SortOption) || "relevant";

  const [filters, setFilters] = useState(() =>
    defaultFilters({ sort: initialSort, maxStartupCost: useSettingsStore.getState().startupCostThresholdZAR }),
  );
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { countries, cities, sources } = useMemo(() => {
    const countries = Array.from(new Set(opportunities.map((o) => o.country))).sort();
    const cities = Array.from(new Set(opportunities.map((o) => o.city).filter((c): c is string => Boolean(c)))).sort();
    const sources = Array.from(new Set(opportunities.map((o) => o.sourceName))).sort();
    return { countries, cities, sources };
  }, [opportunities]);

  const filtered = useMemo(() => applyFilters(opportunities, filters), [opportunities, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateFilters(patch: Partial<typeof filters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(defaultFilters());
    setPage(1);
  }

  const filterPanel = (
    <FilterPanel
      filters={filters}
      onChange={updateFilters}
      onReset={resetFilters}
      countries={countries}
      cities={cities}
      sources={sources}
    />
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">{filterPanel}</div>

      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm lg:hidden"
      >
        <SlidersHorizontal size={15} />
        Filters
      </button>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[85vw] max-w-sm overflow-y-auto bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Filters</p>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">{filtered.length}</span> opportunities match your filters
        </p>

        {pageItems.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No opportunities match your filters"
            description="Try widening your startup cost range, clearing category filters, or lowering the minimum trust score."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
