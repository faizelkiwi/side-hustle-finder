import { DEMO_OPPORTUNITIES } from "../data/opportunities";
import type { SourceConnector } from "./types";

/**
 * Ships demonstration data so the product is fully usable before any live
 * API keys are configured. Server-side only (never runs in the browser).
 */
export const demoConnector: SourceConnector = {
  id: "src-demo",
  name: "Demonstration Data Set",
  type: "Manual",
  async fetchOpportunities() {
    return DEMO_OPPORTUNITIES;
  },
};
