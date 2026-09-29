import type { Opportunity } from "../types";
import type { SourceConnector } from "./types";
import {
  detectScamSignals,
  eligibilityLabel,
  fetchFeed,
  inferCategory,
  inferExperience,
  isUsable,
  openToSouthAfrica,
  remoteJobDefaults,
  summarize,
} from "./jobMapping";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags?: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary?: string;
  description?: string;
}

/**
 * Remotive public API (https://remotive.com/api/remote-jobs). Remotive asks
 * for a link back to the job on remotive.com and light usage; the feed is
 * cached for an hour.
 */
export const remotiveConnector: SourceConnector = {
  id: "src-remotive",
  name: "Remotive",
  type: "API",
  async fetchOpportunities() {
    const feed = await fetchFeed<{ jobs: RemotiveJob[] }>("https://remotive.com/api/remote-jobs");
    return feed.jobs
      .filter((j) => openToSouthAfrica(j.candidate_required_location))
      .map((j): Opportunity => {
        const flags = { partTime: j.job_type === "part_time", freelance: j.job_type === "freelance", contract: j.job_type === "contract" };
        const salary = (j.salary ?? "").trim();
        return {
          ...remoteJobDefaults(),
          id: `remotive-${j.id}`,
          title: j.title.trim(),
          company: j.company_name.trim(),
          category: inferCategory(`${j.title} ${j.category} ${(j.tags ?? []).join(" ")}`, flags),
          description: summarize(j.description) || `${j.title} at ${j.company_name}.`,
          country: eligibilityLabel(j.candidate_required_location),
          earningPotential: salary || "Pay not stated - see listing",
          earningPotentialMonthlyZAR: [0, 0],
          paymentType: flags.freelance || flags.contract ? "Project-Based" : "Salary",
          experienceLevel: inferExperience(j.title),
          skills: (j.tags ?? []).slice(0, 6),
          // Remotive dates have no zone suffix; they're UTC.
          datePosted: new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(j.publication_date) ? j.publication_date : `${j.publication_date}Z`).toISOString(),
          sourceName: "Remotive",
          sourceUrl: j.url,
          trustScore: 85,
          scamSignals: detectScamSignals(`${j.title} ${j.description ?? ""}`),
          ...flags,
        };
      })
      .filter(isUsable);
  },
};
