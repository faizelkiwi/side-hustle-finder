import type { Opportunity } from "../types";
import type { SourceConnector } from "./types";
import {
  detectScamSignals,
  earnings,
  eligibilityLabel,
  fetchFeed,
  inferCategory,
  inferExperience,
  isUsable,
  openToSouthAfrica,
  remoteJobDefaults,
  summarize,
} from "./jobMapping";

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobIndustry?: string[];
  jobType?: string[] | string;
  jobGeo: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
}

/**
 * Jobicy remote jobs API (https://jobicy.com/jobs-rss-feed). Jobicy asks to
 * be credited with a link to the source and for apply buttons to go to the
 * original job URL, which sourceUrl does.
 */
export const jobicyConnector: SourceConnector = {
  id: "src-jobicy",
  name: "Jobicy",
  type: "API",
  async fetchOpportunities() {
    const feed = await fetchFeed<{ jobs?: JobicyJob[] }>("https://jobicy.com/api/v2/remote-jobs?count=100");
    return (feed.jobs ?? [])
      .filter((j) => openToSouthAfrica(j.jobGeo))
      .map((j): Opportunity => {
        const types = [j.jobType ?? []].flat().map((t) => t.toLowerCase());
        const flags = {
          partTime: types.some((t) => t.includes("part")),
          freelance: types.some((t) => t.includes("freelance")),
          contract: types.some((t) => t.includes("contract") || t.includes("temporary")),
        };
        const period = j.salaryPeriod === "hourly" ? "hourly" : j.salaryPeriod === "monthly" ? "monthly" : "yearly";
        return {
          ...remoteJobDefaults(),
          id: `jobicy-${j.id}`,
          title: j.jobTitle.trim(),
          company: j.companyName.trim(),
          category: inferCategory(`${j.jobTitle} ${(j.jobIndustry ?? []).join(" ")}`, flags),
          description: summarize(j.jobExcerpt || j.jobDescription) || `${j.jobTitle} at ${j.companyName}.`,
          country: eligibilityLabel(j.jobGeo),
          ...earnings(j.salaryMin, j.salaryMax, j.salaryCurrency ?? "USD", period),
          experienceLevel: j.jobLevel && /senior|lead|director|manager|executive/i.test(j.jobLevel) ? "Experienced" : inferExperience(j.jobTitle),
          skills: (j.jobIndustry ?? []).slice(0, 6),
          datePosted: new Date(j.pubDate).toISOString(),
          sourceName: "Jobicy",
          sourceUrl: j.url,
          trustScore: 80,
          scamSignals: detectScamSignals(`${j.jobTitle} ${j.jobDescription ?? ""}`),
          ...flags,
        };
      })
      .filter(isUsable);
  },
};
