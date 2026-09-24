import { getAllOpportunities } from "@/lib/dataService";
import { MyOpportunitiesBoard } from "@/components/saved/MyOpportunitiesBoard";

export const dynamic = "force-dynamic";

export default async function MyOpportunitiesPage() {
  const opportunities = await getAllOpportunities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Opportunities</h1>
        <p className="text-sm text-muted">Track opportunities you&apos;ve saved, applied to, and heard back from.</p>
      </div>
      <MyOpportunitiesBoard opportunities={opportunities} />
    </div>
  );
}
