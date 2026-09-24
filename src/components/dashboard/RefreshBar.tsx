"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useRefreshStore } from "@/lib/store/refresh";
import { formatDateTime } from "@/lib/format";
import { useIsClient } from "@/lib/useIsClient";

export function RefreshBar() {
  const router = useRouter();
  const { lastRefreshedAt, markRefreshed } = useRefreshStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mounted = useIsClient();

  useEffect(() => {
    if (mounted && !lastRefreshedAt) markRefreshed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  async function handleRefresh() {
    setIsRefreshing(true);
    markRefreshed();
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-muted">
        Last refreshed:{" "}
        <span className="font-medium text-foreground">
          {mounted && lastRefreshedAt ? formatDateTime(lastRefreshedAt) : "—"}
        </span>
      </p>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
        Refresh Opportunities
      </button>
    </div>
  );
}
