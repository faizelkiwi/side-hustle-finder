import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="flex gap-2 rounded-xl border border-warning-500/20 bg-warning-50 px-4 py-3 text-xs text-warning-700">
      <Info size={15} className="mt-0.5 shrink-0" />
      <p>
        Risk and trust indicators are automated guidance, not a guarantee of legitimacy. Always do your own
        research and never pay money or share sensitive personal information before verifying an opportunity.
      </p>
    </div>
  );
}
