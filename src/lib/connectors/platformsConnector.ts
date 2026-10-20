import type { Opportunity } from "../types";
import type { SourceConnector } from "./types";
import { PLATFORMS_CHECKED_ON, SIDE_HUSTLE_PLATFORMS } from "../data/sideHustlePlatforms";

/** Side-hustle platforms people can join any time; links go to each platform's sign-up page. */
export const platformsConnector: SourceConnector = {
  id: "src-platforms",
  name: "Side Hustle Platforms",
  type: "Manual",
  async fetchOpportunities() {
    const now = new Date().toISOString();
    return SIDE_HUSTLE_PLATFORMS.map(
      (p): Opportunity => ({
        id: `platform-${p.slug}`,
        kind: "platform",
        title: p.title,
        company: p.platform,
        category: p.category,
        description: p.description,
        country: p.where,
        city: null,
        workMode: p.workMode,
        earningPotential: p.pay,
        earningPotentialMonthlyZAR: [0, 0],
        paymentType: p.paymentType,
        startupCostZAR: p.startupCostZAR,
        experienceLevel: p.experienceLevel,
        skills: p.requirements,
        datePosted: PLATFORMS_CHECKED_ON,
        dateDiscovered: PLATFORMS_CHECKED_ON,
        lastChecked: now,
        isActive: true,
        sourceName: p.platform,
        sourceUrl: p.url,
        trustScore: 90,
        scamSignals: [],
        partTime: true,
        weekend: p.weekend,
        evening: p.evening,
        freelance: true,
        contract: false,
      }),
    );
  },
};
