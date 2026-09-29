import { AppShell } from "@/components/layout/AppShell";
import { AccountProvider } from "@/components/account/AccountProvider";
import { SessionGuard } from "@/components/account/SessionGuard";
import { requireAccount } from "@/lib/server/session";

// Signed-in area. Pages also call requireUser()/requireAccount() themselves,
// since this layout doesn't re-run on client-side navigation.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await requireAccount();

  return (
    <AccountProvider account={{ uid: account.uid, email: account.email, name: account.name, plan: account.plan }}>
      <SessionGuard serverUid={account.uid} />
      <AppShell>{children}</AppShell>
    </AccountProvider>
  );
}
