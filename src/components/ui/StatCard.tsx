import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "neutral";
  hint?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-600",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  neutral: "bg-gray-100 text-gray-600",
};

export function StatCard({ label, value, icon: Icon, tone = "brand", hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <div className={clsx("flex h-9 w-9 items-center justify-center rounded-lg", TONE_CLASSES[tone])}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
