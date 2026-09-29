import { CONNECTOR_REGISTRY } from "./connectors/registry";
import { keepLiveListings } from "./connectors/jobMapping";
import type { ConnectorRunResult } from "./connectors/types";
import { deduplicateOpportunities } from "./dedupe";
import { enrichOpportunity } from "./classification";
import type { DataSource, EnrichedOpportunity } from "./types";

/**
 * Single entry point the UI uses to get opportunity data. It fans out to
 * the registered live job-board connectors (each cached for an hour),
 * dedupes, drops listings whose job page has gone, and enriches. A source
 * that fails is skipped so the others still show.
 */
export async function getAllOpportunities(): Promise<EnrichedOpportunity[]> {
  const results = await Promise.all(
    CONNECTOR_REGISTRY.map(async (connector) => {
      try {
        return await connector.fetchOpportunities();
      } catch {
        return [];
      }
    }),
  );

  // Job pages removed since the feed was fetched are dropped, so every link shown is live.
  const merged = await keepLiveListings(deduplicateOpportunities(results.flat()));
  return merged.map(enrichOpportunity).sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export async function getOpportunityById(id: string): Promise<EnrichedOpportunity | null> {
  const all = await getAllOpportunities();
  return all.find((o) => o.id === id) ?? null;
}

export async function runConnectorHealthCheck(): Promise<{
  sources: DataSource[];
  results: ConnectorRunResult[];
}> {
  const results: ConnectorRunResult[] = [];

  for (const connector of CONNECTOR_REGISTRY) {
    try {
      const opportunities = await connector.fetchOpportunities();
      results.push({
        sourceId: connector.id,
        sourceName: connector.name,
        success: true,
        opportunitiesImported: opportunities.length,
        error: null,
        ranAt: new Date().toISOString(),
      });
    } catch (err) {
      results.push({
        sourceId: connector.id,
        sourceName: connector.name,
        success: false,
        opportunitiesImported: 0,
        error: err instanceof Error ? err.message : "Unknown error",
        ranAt: new Date().toISOString(),
      });
    }
  }

  const sources: DataSource[] = results.map((r) => ({
    id: r.sourceId,
    name: r.sourceName,
    type: CONNECTOR_REGISTRY.find((c) => c.id === r.sourceId)?.type ?? "Manual",
    status: r.success && r.opportunitiesImported > 0 ? "Active" : r.success ? "Disabled" : "Error",
    opportunitiesImported: r.opportunitiesImported,
    lastSuccessfulImport: r.success ? r.ranAt : null,
    lastError: r.error,
  }));

  return { sources, results };
}
