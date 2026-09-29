import { getAllOpportunities } from "@/lib/dataService";
import { DailyFeed } from "@/components/alerts/DailyFeed";
import { NotificationPreferences } from "@/components/alerts/NotificationPreferences";
import { UpgradePrompt } from "@/components/account/UpgradePrompt";
import { requireAccount } from "@/lib/server/session";

export default async function AlertsPage() {
  const account = await requireAccount();
  if (account.plan !== "pro") {
    return (
      <UpgradePrompt
        feature="Daily alerts"
        description="Get a daily feed of new opportunities that match what you're looking for."
      />
    );
  }
  const opportunities = await getAllOpportunities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
        <p className="text-sm text-muted">Your daily opportunity feed and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <DailyFeed opportunities={opportunities} />
        <NotificationPreferences />
      </div>
    </div>
  );
}
