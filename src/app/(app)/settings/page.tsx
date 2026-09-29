import { runConnectorHealthCheck } from "@/lib/dataService";
import { requireUser } from "@/lib/server/session";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { DataSourcesTable } from "@/components/settings/DataSourcesTable";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser();
  const { sources } = await runConnectorHealthCheck();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted">Manage your preferences and monitor connected data sources.</p>
      </div>

      <SettingsForm />
      <DataSourcesTable sources={sources} />
    </div>
  );
}
