import type { SourceConnector } from "./types";

/**
 * Example live-API connector stub for Adzuna (https://developer.adzuna.com).
 * Disabled until ADZUNA_APP_ID / ADZUNA_APP_KEY are set - API keys are read
 * from server-side env vars only and are never bundled into client code.
 * Mapping Adzuna's job schema into our `Opportunity` shape (categorisation,
 * startup-cost defaulting to R0 for salaried roles, trust scoring) would
 * happen inside fetchOpportunities() once credentials are configured.
 */
export const adzunaConnector: SourceConnector = {
  id: "src-adzuna",
  name: "Adzuna",
  type: "API",
  async fetchOpportunities() {
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      return [];
    }
    // Live implementation would call the Adzuna Search API here and map
    // results into Opportunity objects.
    return [];
  },
};
