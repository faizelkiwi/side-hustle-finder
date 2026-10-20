import { adzunaConnector } from "./adzunaConnector";
import { freelancerConnector } from "./freelancerConnector";
import { jobicyConnector } from "./jobicyConnector";
import { platformsConnector } from "./platformsConnector";
import { remoteOkConnector } from "./remoteOkConnector";
import { remotiveConnector } from "./remotiveConnector";
import type { SourceConnector } from "./types";

/**
 * Every registered source. Add a new file in this folder implementing
 * `SourceConnector` and list it here to bring a new source online - no
 * other code changes needed. Three kinds of side hustle come in: platforms
 * you can join any time, live freelance gigs, and part-time/freelance/
 * contract roles. Every item links to a real, live page.
 */
export const CONNECTOR_REGISTRY: SourceConnector[] = [
  platformsConnector,
  freelancerConnector,
  remoteOkConnector,
  remotiveConnector,
  jobicyConnector,
  adzunaConnector,
];
