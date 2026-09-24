import type { SourceConnector } from "./types";

/**
 * Example live-feed connector stub for Remote OK's public job feed
 * (https://remoteok.com/api). Kept disabled by default via ENABLE_REMOTEOK
 * so the app never makes outbound calls without an explicit opt-in.
 */
export const remoteOkConnector: SourceConnector = {
  id: "src-remoteok",
  name: "Remote OK",
  type: "API",
  async fetchOpportunities() {
    if (process.env.ENABLE_REMOTEOK !== "true") {
      return [];
    }
    // Live implementation would fetch https://remoteok.com/api and map
    // each listing into an Opportunity, running it through the scam/risk
    // and startup-cost classifiers before it reaches the dashboard.
    return [];
  },
};
