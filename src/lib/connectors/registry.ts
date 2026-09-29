import { adzunaConnector } from "./adzunaConnector";
import { jobicyConnector } from "./jobicyConnector";
import { remoteOkConnector } from "./remoteOkConnector";
import { remotiveConnector } from "./remotiveConnector";
import type { SourceConnector } from "./types";

/**
 * Every registered source. Add a new file in this folder implementing
 * `SourceConnector` and list it here to bring a new source online - no
 * other code changes needed. All listings come from live job boards; each
 * links to the real job post.
 */
export const CONNECTOR_REGISTRY: SourceConnector[] = [remoteOkConnector, remotiveConnector, jobicyConnector, adzunaConnector];
