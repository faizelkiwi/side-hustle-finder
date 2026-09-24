"use client";

import { Bookmark } from "lucide-react";
import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { StatCard } from "@/components/ui/StatCard";

export function SavedCountStat() {
  const count = useSavedOpportunitiesStore((s) => Object.keys(s.saved).length);
  return <StatCard label="Saved Opportunities" value={count} icon={Bookmark} tone="brand" />;
}
