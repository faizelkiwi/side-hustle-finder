import { requireUser } from "@/lib/server/session";
import { BudgetCalculatorClient } from "@/components/budget/BudgetCalculatorClient";

export default async function BudgetCalculatorPage() {
  await requireUser();
  return <BudgetCalculatorClient />;
}
