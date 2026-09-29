import { requireAccount } from "@/lib/server/session";
import { AssistantClient } from "@/components/assistant/AssistantClient";
import { UpgradePrompt } from "@/components/account/UpgradePrompt";

export default async function AssistantPage() {
  const account = await requireAccount();
  if (account.plan !== "pro") {
    return (
      <UpgradePrompt
        feature="AI Opportunity Assistant"
        description="Tell the assistant your skills, hours and budget, and get matched to side hustles that fit you."
      />
    );
  }
  return <AssistantClient />;
}
