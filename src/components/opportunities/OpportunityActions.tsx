"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { useSavedOpportunitiesStore } from "@/lib/store/savedOpportunities";
import { useToggleSave } from "@/components/account/useToggleSave";
import { FREE_SAVE_LIMIT } from "@/lib/plans";
import { formatDate, getExternalUrl } from "@/lib/format";
import type { OpportunityStatus } from "@/lib/types";

const STATUS_OPTIONS: OpportunityStatus[] = ["Interested", "Applied", "Interview", "Accepted", "Rejected", "Archived"];

export function OpportunityActions({ opportunityId, sourceUrl }: { opportunityId: string; sourceUrl: string | null }) {
  const externalUrl = getExternalUrl(sourceUrl);
  const syncError = useSavedOpportunitiesStore((s) => s.syncError);
  const { isSaved, limitReached, toggle } = useToggleSave(opportunityId);
  const meta = useSavedOpportunitiesStore((s) => s.saved[opportunityId]);
  const updateMeta = useSavedOpportunitiesStore((s) => s.updateMeta);
  const setStatus = useSavedOpportunitiesStore((s) => s.setStatus);
  const [notesDraft, setNotesDraft] = useState(meta?.notes ?? "");

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        {externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Apply / View Opportunity <ExternalLink size={15} />
          </a>
        ) : (
          <p className="inline-flex flex-1 items-center justify-center rounded-lg bg-gray-50 px-4 py-2.5 text-center text-sm text-muted">
            No verified link available for this listing
          </p>
        )}
        <button
          onClick={toggle}
          disabled={limitReached}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaved ? <BookmarkCheck size={16} className="text-brand-600" /> : <Bookmark size={16} />}
          {isSaved ? "Saved to My Opportunities" : "Save Opportunity"}
        </button>
      </div>

      {limitReached && (
        <p className="text-xs text-muted">
          You&apos;ve saved {FREE_SAVE_LIMIT} opportunities, the Free plan limit.{" "}
          <Link href="/billing" className="font-medium text-brand-600 hover:text-brand-700">
            Upgrade to Pro
          </Link>{" "}
          for unlimited saves, or remove one from My Opportunities.
        </p>
      )}
      {syncError && <p className="text-xs text-danger-700">{syncError}</p>}

      {isSaved && meta && (
        <div className="space-y-3 border-t border-border pt-4">
          <div>
            <label className="text-xs font-medium text-muted">Status</label>
            <select
              value={meta.status}
              onChange={(e) => setStatus(opportunityId, e.target.value as OpportunityStatus)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Expected earnings</label>
              <input
                type="text"
                value={meta.expectedEarnings}
                onChange={(e) => updateMeta(opportunityId, { expectedEarnings: e.target.value })}
                placeholder="e.g. R5,000/mo"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Actual earnings</label>
              <input
                type="text"
                value={meta.actualEarnings}
                onChange={(e) => updateMeta(opportunityId, { actualEarnings: e.target.value })}
                placeholder="e.g. R3,200/mo"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted">Notes</label>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() => updateMeta(opportunityId, { notes: notesDraft })}
              rows={3}
              placeholder="Personal notes about this opportunity..."
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {meta.applicationDate && (
            <p className="text-xs text-muted">
              Applied on {formatDate(meta.applicationDate)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
