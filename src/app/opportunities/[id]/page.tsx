import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Wifi, Wallet, GraduationCap, Calendar, Globe, AlertTriangle } from "lucide-react";
import { getAllOpportunities, getOpportunityById } from "@/lib/dataService";
import { formatDateTime } from "@/lib/format";
import { CategoryBadge, CostTierBadge, RiskBadge, ScoreBadge } from "@/components/ui/Badges";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { OpportunityActions } from "@/components/opportunities/OpportunityActions";

export async function generateStaticParams() {
  const opportunities = await getAllOpportunities();
  return opportunities.map((o) => ({ id: o.id }));
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getOpportunityById(id);
  if (!opportunity) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={15} /> Back to Find Opportunities
      </Link>

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={opportunity.category} />
          <RiskBadge level={opportunity.riskLevel} />
          <CostTierBadge tier={opportunity.startupCostTier} />
          <ScoreBadge score={opportunity.opportunityScore} />
        </div>

        <h1 className="mt-3 text-xl font-semibold text-foreground">{opportunity.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {opportunity.company} · via {opportunity.sourceName}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">{opportunity.description}</p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow icon={MapPin} label="Location" value={`${opportunity.city ?? "Remote"}, ${opportunity.country}`} />
          <InfoRow icon={Wifi} label="Work mode" value={opportunity.workMode} />
          <InfoRow icon={Wallet} label="Earning potential" value={`${opportunity.earningPotential} (${opportunity.paymentType})`} />
          <InfoRow icon={Wallet} label="Startup cost" value={`R${opportunity.startupCostZAR.toLocaleString()} (${opportunity.startupCostTier})`} />
          <InfoRow icon={GraduationCap} label="Experience required" value={opportunity.experienceLevel} />
          <InfoRow icon={Calendar} label="Date posted" value={formatDateTime(opportunity.datePosted)} />
          <InfoRow icon={Globe} label="Source" value={opportunity.sourceName} />
        </div>

        {opportunity.skills.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-muted">Skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {opportunity.skills.map((skill) => (
                <span key={skill} className="rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5 text-xs text-muted">
          {[
            opportunity.partTime && "Part-time",
            opportunity.weekend && "Weekend",
            opportunity.evening && "Evening",
            opportunity.freelance && "Freelance",
            opportunity.contract && "Contract",
          ]
            .filter(Boolean)
            .map((label) => (
              <span key={label as string} className="rounded-full bg-gray-100 px-2.5 py-1">
                {label}
              </span>
            ))}
        </div>
      </div>

      {opportunity.scamSignals.length > 0 && (
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-danger-700">
            <AlertTriangle size={16} />
            Risk signals detected
          </div>
          <ul className="mt-2 space-y-2">
            {opportunity.scamSignals.map((signal) => (
              <li key={signal.label} className="text-sm text-danger-700">
                <span className="font-medium">{signal.label}:</span> {signal.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <DisclaimerBanner />

      <OpportunityActions opportunityId={opportunity.id} sourceUrl={opportunity.sourceUrl} />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
      <Icon size={15} className="mt-0.5 text-gray-400" />
      <div>
        <p className="text-[11px] text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
