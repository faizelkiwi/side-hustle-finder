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

interface RemoteOkJob {
  id: string;
  date: string;
  company: string;
  position: string;
  tags?: string[];
  description?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
}

/**
 * Remote OK public job feed (https://remoteok.com/api). Their terms require
 * linking back to the job on Remote OK and naming it as the source, which
 * sourceUrl/sourceName do.
 */
export const remoteOkConnector: SourceConnector = {
  id: "src-remoteok",
  name: "Remote OK",
  type: "API",
  async fetchOpportunities() {
    // The first element is a legal notice, not a job.
    const feed = await fetchFeed<(RemoteOkJob | { legal: string })[]>("https://remoteok.com/api");
    return feed
      .filter((j): j is RemoteOkJob => "id" in j && openToSouthAfrica(j.location))
      .map((j): Opportunity => {
        const tags = j.tags ?? [];
        const text = `${j.position} ${tags.join(" ")}`;
        const flags = {
          partTime: tags.some((t) => /part.?time/i.test(t)),
          freelance: tags.some((t) => /freelance/i.test(t)),
          contract: tags.some((t) => /contract/i.test(t)),
        };
        return {
          ...remoteJobDefaults(),
          id: `remoteok-${j.id}`,
          title: j.position.trim(),
          company: j.company.trim(),
          category: inferCategory(text, flags),
          description: summarize(j.description) || `${j.position} at ${j.company}.`,
          country: eligibilityLabel(j.location ?? ""),
          ...earnings(j.salary_min, j.salary_max, "USD", "yearly"),
          experienceLevel: inferExperience(j.position),
          skills: tags.slice(0, 6),
          datePosted: new Date(j.date).toISOString(),
          sourceName: "Remote OK",
          sourceUrl: j.url.replace("remoteOK.com", "remoteok.com"),
          trustScore: 80,
          scamSignals: detectScamSignals(`${j.position} ${j.description ?? ""}`),
          ...flags,
        };
      })
      .filter(isUsable);
  },
};
