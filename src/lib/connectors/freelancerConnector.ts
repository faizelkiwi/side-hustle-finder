import type { Opportunity } from "../types";
import type { SourceConnector } from "./types";
import { detectScamSignals, earnings, fetchFeed, inferCategory, isUsable, remoteJobDefaults, summarize } from "./jobMapping";

interface FreelancerProject {
  id: number;
  title: string;
  seo_url: string;
  status: string;
  type: "fixed" | "hourly";
  preview_description?: string;
  submitdate: number;
  language?: string;
  local?: boolean;
  deleted?: boolean;
  nonpublic?: boolean;
  currency?: { code?: string };
  budget?: { minimum?: number; maximum?: number };
  jobs?: { name: string }[];
  bid_stats?: { bid_count?: number };
  upgrades?: Record<string, boolean | null>;
}

// Upgrades that restrict who can see or bid on a project. Their pages 404 for
// most visitors, so they'd be dead links in the app.
const RESTRICTED_UPGRADES = ["recruiter", "assisted", "ip_contract", "pf_only", "NDA", "sealed", "private", "qualified", "nonpublic"];

// Newest open gigs kept per refresh; each one's page is checked before showing.
const MAX_GIGS = 40;

/**
 * Live freelance gigs from Freelancer.com's public projects API (no key
 * needed). Only open, public, English, work-from-anywhere projects are kept;
 * each links to the project page where you can bid.
 */
export const freelancerConnector: SourceConnector = {
  id: "src-freelancer",
  name: "Freelancer.com",
  type: "API",
  async fetchOpportunities() {
    const feed = await fetchFeed<{ status: string; result?: { projects?: FreelancerProject[] } }>(
      "https://www.freelancer.com/api/projects/0.1/projects/active/?limit=100&job_details=true&compact=true&sort_field=time_updated",
    );
    return (feed.result?.projects ?? [])
      .filter(
        (p) =>
          p.status === "active" &&
          !p.deleted &&
          !p.nonpublic &&
          !p.local &&
          (p.language ?? "en") === "en" &&
          p.seo_url &&
          !RESTRICTED_UPGRADES.some((u) => p.upgrades?.[u]),
      )
      .sort((a, b) => b.submitdate - a.submitdate)
      .slice(0, MAX_GIGS)
      .map((p): Opportunity => {
        const skills = (p.jobs ?? []).map((j) => j.name);
        const bids = p.bid_stats?.bid_count ?? 0;
        // Gigs fit around other work, so they count as part-time; the category falls back to Freelance Work.
        const flags = { partTime: true, freelance: true, contract: false };
        return {
          ...remoteJobDefaults(),
          id: `freelancer-${p.id}`,
          kind: "gig",
          title: p.title.trim(),
          company: "Freelancer.com client",
          category: inferCategory(`${p.title} ${skills.join(" ")}`, { partTime: false, freelance: true, contract: false }),
          description:
            summarize(p.preview_description) + (bids ? ` (${bids} bid${bids === 1 ? "" : "s"} so far.)` : " (No bids yet.)"),
          country: "Worldwide (online)",
          ...earnings(p.budget?.minimum, p.budget?.maximum, p.currency?.code ?? "USD", p.type === "hourly" ? "hourly" : "fixed"),
          experienceLevel: "Intermediate",
          skills: skills.slice(0, 6),
          datePosted: new Date(p.submitdate * 1000).toISOString(),
          sourceName: "Freelancer.com",
          sourceUrl: `https://www.freelancer.com/projects/${p.seo_url}`,
          // Clients aren't vetted in the feed, so gigs start a little lower than curated platforms.
          trustScore: 70,
          scamSignals: detectScamSignals(`${p.title} ${p.preview_description ?? ""}`),
          ...flags,
        };
      })
      .filter(isUsable);
  },
};
