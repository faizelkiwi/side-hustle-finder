import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Wrench, AlertTriangle } from "lucide-react";
import { SIDE_HUSTLE_IDEAS } from "@/lib/data/sideHustleIdeas";
import { CategoryBadge } from "@/components/ui/Badges";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";


export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const idea = SIDE_HUSTLE_IDEAS.find((i) => i.id === id);
  if (!idea) notFound();

  const [minCost, maxCost] = idea.startupCostZAR;
  const costLabel = minCost === 0 && maxCost === 0 ? "Free to start" : `R${minCost.toLocaleString()} - R${maxCost.toLocaleString()}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/ideas" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={15} /> Back to Side Hustle Ideas
      </Link>

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={idea.category} />
          <DifficultyBadge level={idea.difficulty} />
        </div>
        <h1 className="mt-3 text-xl font-semibold text-foreground">{idea.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">{idea.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Startup cost" value={costLabel} />
          <Stat label="Time commitment" value={idea.timeCommitment} />
          <Stat label="Income range" value={idea.incomeRangeZAR} />
          <Stat label="Location" value={idea.locationType} />
        </div>

        {idea.skillsRequired.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-muted">Skills required</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {idea.skillsRequired.map((s) => (
                <span key={s} className="rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckCircle2 size={16} className="text-success-500" />
          Steps to get started
        </div>
        <ol className="mt-3 space-y-2">
          {idea.stepsToStart.map((step, i) => (
            <li key={step} className="flex gap-2.5 text-sm text-gray-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wrench size={16} className="text-brand-600" />
            Recommended tools
          </div>
          <ul className="mt-2 space-y-1.5">
            {idea.recommendedTools.map((tool) => (
              <li key={tool} className="text-sm text-gray-600">
                · {tool}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-warning-500/20 bg-warning-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning-700">
            <AlertTriangle size={16} />
            Potential risks
          </div>
          <ul className="mt-2 space-y-1.5">
            {idea.potentialRisks.map((risk) => (
              <li key={risk} className="text-sm text-warning-700">
                · {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
