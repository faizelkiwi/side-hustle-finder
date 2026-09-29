"use client";

import { useState } from "react";
import { Sparkles, Info } from "lucide-react";
import Link from "next/link";
import { recommendSideHustles, type AssistantProfile } from "@/lib/assistant";
import { CategoryBadge } from "@/components/ui/Badges";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";

const DEFAULT_PROFILE: AssistantProfile = {
  skills: "",
  experience: "",
  hoursPerWeek: 10,
  workType: "Any",
  desiredMonthlyIncomeZAR: 5000,
  maxStartupBudgetZAR: 500,
  location: "Remote Worldwide",
  interests: "",
};

export function AssistantClient() {
  const [profile, setProfile] = useState<AssistantProfile>(DEFAULT_PROFILE);
  const [submitted, setSubmitted] = useState(false);

  const recommendations = submitted ? recommendSideHustles(profile) : [];

  function update<K extends keyof AssistantProfile>(key: K, value: AssistantProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Opportunity Assistant</h1>
          <p className="text-sm text-muted">Tell us about yourself and get matched to relevant side hustle categories.</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted">Skills</label>
          <input
            type="text"
            value={profile.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="e.g. writing, Excel, customer service, design"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted">Work experience</label>
          <input
            type="text"
            value={profile.experience}
            onChange={(e) => update("experience", e.target.value)}
            placeholder="e.g. 3 years in admin, some bookkeeping"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted">Interests</label>
          <input
            type="text"
            value={profile.interests}
            onChange={(e) => update("interests", e.target.value)}
            placeholder="e.g. cars, teaching, social media, baking"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted">Available hours / week</label>
          <input
            type="number"
            min={1}
            value={profile.hoursPerWeek}
            onChange={(e) => update("hoursPerWeek", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted">Preferred work type</label>
          <select
            value={profile.workType}
            onChange={(e) => update("workType", e.target.value as AssistantProfile["workType"])}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="Any">Any</option>
            <option value="Online">Online</option>
            <option value="Local">Local</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted">Desired monthly income (ZAR)</label>
          <input
            type="number"
            min={0}
            step={500}
            value={profile.desiredMonthlyIncomeZAR}
            onChange={(e) => update("desiredMonthlyIncomeZAR", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted">Max startup budget (ZAR)</label>
          <input
            type="number"
            min={0}
            step={100}
            value={profile.maxStartupBudgetZAR}
            onChange={(e) => update("maxStartupBudgetZAR", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted">Location</label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => update("location", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Sparkles size={15} />
            Get Recommendations
          </button>
        </div>
      </form>

      {submitted && (
        <div className="space-y-4">
          <div className="flex gap-2 rounded-xl border border-warning-500/20 bg-warning-50 px-4 py-3 text-xs text-warning-700">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>
              These are rule-based suggestions from your inputs, not a guarantee of earnings. Actual income depends on
              effort, market demand, and factors outside this tool&apos;s control.
            </p>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-sm text-muted">
              No strong matches yet - try adding more detail to skills/interests, or raising your startup budget.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recommendations.map(({ idea, matchScore, reasons }) => (
                <div key={idea.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <CategoryBadge category={idea.category} />
                      <DifficultyBadge level={idea.difficulty} />
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {matchScore}% match
                    </span>
                  </div>
                  <Link href={`/ideas/${idea.id}`} className="mt-2 block text-sm font-semibold text-foreground hover:text-brand-600">
                    {idea.title}
                  </Link>
                  <ul className="mt-2 space-y-1">
                    {reasons.map((reason) => (
                      <li key={reason} className="text-xs text-muted">
                        · {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
