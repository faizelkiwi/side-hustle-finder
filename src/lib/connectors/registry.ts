import { adzunaConnector } from "./adzunaConnector";
import { demoConnector } from "./demoConnector";
import { remoteOkConnector } from "./remoteOkConnector";
import type { SourceConnector } from "./types";

/**
 * Every registered source. Add a new file in this folder implementing
 * `SourceConnector` and list it here to bring a new source online - no
 * other code changes needed.
 */
export const CONNECTOR_REGISTRY: SourceConnector[] = [demoConnector, adzunaConnector, remoteOkConnector];
