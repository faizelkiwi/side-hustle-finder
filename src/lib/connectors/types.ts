import type { Opportunity } from "../types";

/**
 * Every data source - demo, RSS feed, or partner API - implements this
 * interface. The dashboard only ever talks to `DataService`, which fans
 * out to whichever connectors are registered and active, so swapping demo
 * data for a live source never requires touching UI code.
 */
export interface SourceConnector {
  id: string;
  name: string;
  type: "API" | "RSS" | "Manual" | "Partner Feed";
  /** Fetch the current set of opportunities from this source. */
  fetchOpportunities(): Promise<Opportunity[]>;
}

export interface ConnectorRunResult {
  sourceId: string;
  sourceName: string;
  success: boolean;
  opportunitiesImported: number;
  error: string | null;
  ranAt: string;
}
