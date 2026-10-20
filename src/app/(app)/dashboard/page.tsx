import { Store, Zap, Clock, Briefcase, MapPin, Wallet } from "lucide-react";
import { requireUser } from "@/lib/server/session";
import { getAllOpportunities } from "@/lib/dataService";
import { isNew } from "@/lib/format";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { RefreshBar } from "@/components/dashboard/RefreshBar";
import { LatestOpportunities } from "@/components/dashboard/LatestOpportunities";
import { SavedCountStat } from "@/components/dashboard/SavedCountStat";

export default async function DashboardPage() {
  await requireUser();
  const opportunities = await getAllOpportunities();

  const platforms = opportunities.filter((o) => o.kind === "platform");
  const dated = opportunities.filter((o) => o.kind !== "platform");
  const gigs = dated.filter((o) => o.kind === "gig");
  const roles = dated.filter((o) => o.kind === "role");
  const newGigs = dated.filter((o) => isNew(o.datePosted)).length;
  const local = opportunities.filter((o) => o.workMode !== "Remote").length;
  const zeroCost = opportunities.filter((o) => o.startupCostZAR === 0).length;
  const topPlatforms = [...platforms].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Your daily side hustle briefing: platforms to join and fresh paid gigs.</p>
      </div>

      <RefreshBar />
      <DisclaimerBanner />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Platforms to join" value={platforms.length} icon={Store} tone="brand" />
        <StatCard label="Live gigs" value={gigs.length} icon={Zap} tone="warning" />
        <StatCard label="New in last 24h" value={newGigs} icon={Clock} tone="success" />
        <StatCard label="Part-time roles" value={roles.length} icon={Briefcase} tone="neutral" />
        <StatCard label="Local (in SA)" value={local} icon={MapPin} tone="neutral" />
        <StatCard label="Free to start" value={zeroCost} icon={Wallet} tone="success" />
        <SavedCountStat />
      </div>

      <LatestOpportunities opportunities={dated} />

      <section>
        <SectionHeader
          title="Side Hustle Platforms - Join Today"
          subtitle="Trusted platforms South Africans can sign up to and start earning on"
          actionHref="/opportunities?type=platform&sort=relevant"
          actionLabel={`View all ${platforms.length}`}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topPlatforms.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      </section>
    </div>
  );
}
