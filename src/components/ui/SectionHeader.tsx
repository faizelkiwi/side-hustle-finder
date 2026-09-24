import Link from "next/link";

export function SectionHeader({
  title,
  subtitle,
  actionHref,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          {actionLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
