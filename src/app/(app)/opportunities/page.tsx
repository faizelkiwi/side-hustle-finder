import { Suspense } from "react";
import { requireUser } from "@/lib/server/session";
import { getAllOpportunities } from "@/lib/dataService";
import { OpportunityExplorer } from "@/components/opportunities/OpportunityExplorer";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  await requireUser();
  const opportunities = await getAllOpportunities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Find Opportunities</h1>
        <p className="text-sm text-muted">Search and filter {opportunities.length} opportunities from across sources.</p>
      </div>

      <Suspense fallback={null}>
        <OpportunityExplorer opportunities={opportunities} />
      </Suspense>
    </div>
  );
}
