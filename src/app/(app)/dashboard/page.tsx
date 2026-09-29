import { Briefcase, Wifi, MapPin, Wallet, Star, Clock } from "lucide-react";
import { requireUser } from "@/lib/server/session";
import { getAllOpportunities } from "@/lib/dataService";

// Dynamic so the Refresh Opportunities button re-runs connectors on demand
// once live sources replace the demo data set.
export const dynamic = "force-dynamic";
import { isToday } from "@/lib/format";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { RefreshBar } from "@/components/dashboard/RefreshBar";
import { SavedCountStat } from "@/components/dashboard/SavedCountStat";

export default async function DashboardPage() {
  await requireUser();
  const opportunities = await getAllOpportunities();

  const newToday = opportunities.filter((o) => isToday(o.dateDiscovered)).length;
  const remote = opportunities.filter((o) => o.workMode === "Remote").length;
  const local = opportunities.filter((o) => o.workMode !== "Remote").length;
  const zeroCost = opportunities.filter((o) => o.startupCostZAR === 0).length;

  const highestRated = [...opportunities].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 3);
  const recent = [...opportunities]
    .sort((a, b) => new Date(b.dateDiscovered).getTime() - new Date(a.dateDiscovered).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Your daily side hustle intelligence briefing.</p>
      </div>

      <RefreshBar />
      <DisclaimerBanner />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Opportunities" value={opportunities.length} icon={Briefcase} tone="brand" />
        <StatCard label="New Today" value={newToday} icon={Clock} tone="success" />
        <StatCard label="Remote" value={remote} icon={Wifi} tone="brand" />
        <StatCard label="Local (SA)" value={local} icon={MapPin} tone="neutral" />
        <StatCard label="Zero Startup Cost" value={zeroCost} icon={Wallet} tone="success" />
        <SavedCountStat />
        <StatCard
          label="Avg. Opportunity Score"
          value={Math.round(opportunities.reduce((s, o) => s + o.opportunityScore, 0) / opportunities.length)}
          icon={Star}
          tone="warning"
        />
      </div>

      <section>
        <SectionHeader
          title="Highest-Rated Opportunities"
          subtitle="Best combination of low cost, legitimacy, and earning potential"
          actionHref="/opportunities?sort=score"
          actionLabel="View all"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highestRated.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Recently Added"
          subtitle="Newest opportunities discovered across all sources"
          actionHref="/opportunities?sort=newest"
          actionLabel="View all"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      </section>
    </div>
  );
}
