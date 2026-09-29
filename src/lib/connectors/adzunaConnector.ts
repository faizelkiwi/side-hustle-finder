import type { Opportunity, WorkMode } from "../types";
import type { SourceConnector } from "./types";
import { detectScamSignals, earnings, fetchFeed, inferCategory, inferExperience, isUsable, summarize } from "./jobMapping";

interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  created: string;
  redirect_url: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  category?: { label?: string };
  salary_min?: number;
  salary_max?: number;
  contract_time?: "part_time" | "full_time";
  contract_type?: "permanent" | "contract";
}

// Side-hustle friendly searches across South Africa, newest first.
const SEARCHES = ["part time", "freelance", "weekend", "remote"];

/**
 * Adzuna job search for South Africa (https://developer.adzuna.com). Runs
 * only when ADZUNA_APP_ID / ADZUNA_APP_KEY are set; keys stay server-side.
 */
export const adzunaConnector: SourceConnector = {
  id: "src-adzuna",
  name: "Adzuna",
  type: "API",
  async fetchOpportunities() {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) return [];

    const pages = await Promise.all(
      SEARCHES.map((what) =>
        fetchFeed<{ results: AdzunaJob[] }>(
          `https://api.adzuna.com/v1/api/jobs/za/search/1?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}` +
            `&results_per_page=25&what=${encodeURIComponent(what)}&sort_by=date&max_days_old=21&content-type=application/json`,
        ).then((r) => r.results, () => [] as AdzunaJob[]),
      ),
    );

    const seen = new Set<string>();
    return pages
      .flat()
      .filter((j) => !seen.has(j.id) && seen.add(j.id))
      .map((j): Opportunity => {
        const text = `${j.title} ${j.description ?? ""}`;
        const remote = /\bremote|work from home|wfh\b/i.test(text);
        const flags = {
          partTime: j.contract_time === "part_time" || /part.?time/i.test(j.title),
          freelance: /freelance/i.test(j.title),
          contract: j.contract_type === "contract",
        };
        const area = j.location?.area ?? [];
        const now = new Date().toISOString();
        return {
          id: `adzuna-${j.id}`,
          title: summarize(j.title, 120),
          company: j.company?.display_name?.trim() || "Company not named",
          category: inferCategory(`${j.title} ${j.category?.label ?? ""}`, flags),
          description: summarize(j.description) || j.title,
          country: "South Africa",
          city: area.length > 2 ? area[area.length - 1] : (j.location?.display_name ?? null),
          workMode: (remote ? "Remote" : "Onsite") as WorkMode,
          ...earnings(j.salary_min, j.salary_max, "ZAR", (j.salary_max ?? 0) > 50000 ? "yearly" : "monthly"),
          startupCostZAR: 0,
          experienceLevel: inferExperience(j.title),
          skills: [],
          datePosted: new Date(j.created).toISOString(),
          dateDiscovered: now,
          lastChecked: now,
          isActive: true,
          sourceName: "Adzuna",
          sourceUrl: j.redirect_url,
          trustScore: 75,
          scamSignals: detectScamSignals(text),
          weekend: /weekend/i.test(text),
          evening: /evening|night shift/i.test(text),
          ...flags,
        };
      })
      .filter(isUsable);
  },
};
