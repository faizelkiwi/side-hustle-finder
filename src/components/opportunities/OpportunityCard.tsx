"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Wifi, Clock, CalendarClock } from "lucide-react";
import type { EnrichedOpportunity } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToggleSave } from "@/components/account/useToggleSave";
import { useSettingsStore, formatCurrencyFromZAR } from "@/lib/store/settings";
import { formatDateTime, formatRelativeDate, getExternalUrl, isNew, isWithinDays } from "@/lib/format";
import { CategoryBadge, CostTierBadge, RiskBadge, ScoreBadge } from "@/components/ui/Badges";

export function OpportunityCard({ opportunity }: { opportunity: EnrichedOpportunity }) {
  const router = useRouter();
  const { isSaved, limitReached, toggle } = useToggleSave(opportunity.id);
  const currency = useSettingsStore((s) => s.currency);
  const externalUrl = getExternalUrl(opportunity.sourceUrl);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/opportunities/${opportunity.id}`} className="block">
            <h3 className="truncate text-sm font-semibold text-foreground hover:text-brand-600">
              {opportunity.title}
            </h3>
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted">{opportunity.company}</p>
          <PostedDate iso={opportunity.datePosted} />
        </div>
        <button
          onClick={() => (limitReached ? router.push("/billing") : toggle())}
          aria-label={isSaved ? "Remove from saved" : limitReached ? "Save limit reached - upgrade to Pro" : "Save opportunity"}
          title={limitReached ? "Free plan save limit reached - upgrade to Pro" : undefined}
          className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-brand-600"
        >
          {isSaved ? <BookmarkCheck size={18} className="text-brand-600" /> : <Bookmark size={18} />}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <CategoryBadge category={opportunity.category} />
        <RiskBadge level={opportunity.riskLevel} />
        <CostTierBadge tier={opportunity.startupCostTier} />
        <ScoreBadge score={opportunity.opportunityScore} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{opportunity.description}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <MapPin size={13} />
          <span className="truncate">{opportunity.city ?? opportunity.country}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi size={13} />
          <span className="truncate">{opportunity.workMode}</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <Clock size={13} />
          <span className="truncate">
            {opportunity.earningPotential} · {opportunity.paymentType}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {opportunity.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
            {skill}
          </span>
        ))}
        {opportunity.skills.length > 3 && (
          <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
            +{opportunity.skills.length - 3} more
          </span>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <div className="text-xs text-muted">
          <span className="font-medium text-foreground">
            {formatCurrencyFromZAR(opportunity.startupCostZAR, currency)}
          </span>{" "}
          to start
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="flex-1 rounded-md border border-border px-2.5 py-1.5 text-center text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Details
          </Link>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              View <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/** "Posted 3h ago · 29 Sep 2026, 14:05" with a New badge for the last 24 hours. */
function PostedDate({ iso }: { iso: string }) {
  // formatRelativeDate already returns a plain date after 7 days; only prefix it for recent posts.
  const absolute = formatDateTime(iso);
  const label = isWithinDays(iso, 7) ? `${formatRelativeDate(iso)} · ${absolute}` : absolute;
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-700">
      <CalendarClock size={13} className="shrink-0 text-brand-600" />
      {/* Relative time depends on the viewer's clock, so server and browser can differ by a minute. */}
      <time dateTime={iso} suppressHydrationWarning>
        Posted {label}
      </time>
      {isNew(iso) && (
        <span className="rounded-full bg-success-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success-700">
          New
        </span>
      )}
    </p>
  );
}
