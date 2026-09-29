import Link from "next/link";
import { Lock, Check } from "lucide-react";
import { PLANS } from "@/lib/plans";

/** Shown in place of a Pro-only feature for Free accounts. */
export function UpgradePrompt({ feature, description }: { feature: string; description: string }) {
  const pro = PLANS.pro;
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Lock size={20} />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-foreground">{feature} is a Pro feature</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left text-sm text-gray-700">
        {pro.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-success-500" /> {f}
          </li>
        ))}
      </ul>
      <Link
        href="/billing"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Upgrade to Pro · {pro.price} {pro.cadence}
      </Link>
    </div>
  );
}
