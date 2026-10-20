import type { ExperienceLevel, Opportunity, OpportunityCategory, PaymentType, ScamSignal } from "../types";

// Shared helpers for turning public job-board feeds into Opportunity records.

/** Fetch a feed, cached for 10 minutes so page views don't hit the job boards directly. */
export async function fetchFeed<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "user-agent": "SideHustleFinder/1.0 (+https://side-hustle-finder-wine.vercel.app)", accept: "application/json" },
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return (await res.json()) as T;
}

// Approximate conversion so pay can be compared in rand. Only used for
// ranking and filtering; the listing's own currency is always shown too.
const TO_ZAR: Record<string, number> = {
  USD: 18, EUR: 20, GBP: 23, ZAR: 1, AUD: 12, CAD: 13, NZD: 11, SGD: 14, HKD: 2.3, INR: 0.21, PHP: 0.31,
};

// Hourly side-hustle work is assumed to be about 10 hours a week.
const SIDE_HUSTLE_HOURS_PER_MONTH = 40;

const OPEN_TO_SA = /\b(worldwide|anywhere|global(ly)?|international|emea|africa|south africa)\b/i;

/**
 * Whether someone in South Africa can apply. Worldwide/EMEA/Africa listings
 * qualify; bare "Remote" does too. Anything naming other specific countries
 * or regions (e.g. "USA", "Remote - US", "Europe") doesn't.
 */
export function openToSouthAfrica(location: string | null | undefined): boolean {
  const text = (location ?? "").trim();
  if (!text) return false;
  if (OPEN_TO_SA.test(text)) return true;
  return /^(remote|remoto|fully remote|100% remote)$/i.test(text);
}

/** Label for the location field, e.g. "Worldwide" or "EMEA". */
export function eligibilityLabel(location: string): string {
  const text = location.trim();
  if (/^(remote|remoto|fully remote|100% remote)$/i.test(text)) return "Worldwide";
  return text.length > 40 ? `${text.slice(0, 37)}...` : text;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };

/** Plain-text summary from an HTML job description. */
export function summarize(html: string | null | undefined, max = 280): string {
  const text = (html ?? "")
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#?\w+);/g, (m, e: string) => ENTITIES[e] ?? (e.startsWith("#") ? String.fromCharCode(Number(e.slice(1))) : m))
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}...` : text;
}

const CATEGORY_RULES: [RegExp, OpportunityCategory][] = [
  [/\b(data annotat|annotator|labell?ing|ai trainer|ai tutor|rater|llm|prompt|rlhf|ai training)\b/i, "AI-Related Freelance Work"],
  [/\b(virtual assistant|executive assistant|personal assistant)\b/i, "Virtual Assistant"],
  [/\bdata entry\b/i, "Data Entry"],
  [/\btranscri/i, "Transcription"],
  [/\b(tutor|teacher|teaching|instructor|esl)\b/i, "Online Tutoring"],
  [/\b(customer (support|service|success|experience)|support (agent|specialist|representative)|help ?desk|call cent)/i, "Customer Service"],
  [/\bsocial media\b/i, "Social Media Management"],
  [/\b(writer|copywrit|content (writer|creator|marketing)|editor|proofread)/i, "Content Writing"],
  [/\b(graphic design|designer|illustrator|ui\/ux|ux|ui designer)\b/i, "Graphic Design"],
  [/\b(qa|tester|testing|quality assurance)\b/i, "Website Testing"],
  [/\b(consultant|advisor|adviser)\b/i, "Consulting"],
  [/\b(admin|administrative|office|bookkeep|coordinator)\b/i, "Administrative Work"],
  [/\baffiliate\b/i, "Affiliate Marketing"],
];

export function inferCategory(text: string, flags: { partTime: boolean; freelance: boolean; contract: boolean }): OpportunityCategory {
  for (const [pattern, category] of CATEGORY_RULES) if (pattern.test(text)) return category;
  if (flags.partTime) return "Remote Part-Time Jobs";
  if (flags.freelance || flags.contract) return "Freelance Work";
  return "Remote Jobs";
}

export function inferExperience(title: string): ExperienceLevel {
  if (/\b(senior|sr\.?|lead|principal|staff|head|director|manager|vp|chief)\b/i.test(title)) return "Experienced";
  if (/\b(junior|jr\.?|entry|intern(ship)?|graduate|trainee|apprentice)\b/i.test(title)) return "Entry Level";
  return "Intermediate";
}

/**
 * Earnings text in the listing's own currency, plus a normalised ZAR range
 * used for ranking and filters. "fixed" is a one-off project budget; hourly
 * pay is scaled to a side-hustle month of ~40 hours.
 */
export function earnings(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = "USD",
  period: "yearly" | "monthly" | "hourly" | "fixed" = "yearly",
): { earningPotential: string; earningPotentialMonthlyZAR: [number, number]; paymentType: PaymentType } {
  const lo = Number(min) || 0;
  const hi = Number(max) || lo;
  const code = currency.toUpperCase();
  const paymentType: PaymentType = period === "hourly" ? "Hourly" : period === "fixed" ? "Fixed Fee" : "Salary";
  if (!hi) return { earningPotential: "Pay not stated - see listing", earningPotentialMonthlyZAR: [0, 0], paymentType };

  let money: (n: number) => string;
  try {
    const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: 0 });
    money = (n) => fmt.format(n);
  } catch {
    money = (n) => `${code} ${Math.round(n).toLocaleString("en-US")}`;
  }
  const unit = { yearly: " / year", monthly: " / month", hourly: " / hour", fixed: " fixed price" }[period];
  const earningPotential = `${money(lo)}${hi !== lo ? ` - ${money(hi)}` : ""}${unit}`;

  const rate = TO_ZAR[code];
  if (!rate) return { earningPotential, earningPotentialMonthlyZAR: [0, 0], paymentType };
  const perMonth = { yearly: 1 / 12, monthly: 1, hourly: SIDE_HUSTLE_HOURS_PER_MONTH, fixed: 1 }[period];
  return {
    earningPotential,
    earningPotentialMonthlyZAR: [Math.round(lo * perMonth * rate), Math.round(hi * perMonth * rate)],
    paymentType,
  };
}

const SCAM_PATTERNS: [RegExp, ScamSignal][] = [
  [/\b(registration|training|starter|joining|application) fee\b|pay (a|an|the) (fee|deposit)|upfront (fee|payment)/i, { label: "Asks for money upfront", detail: "Legitimate employers don't charge you to apply or start work." }],
  [/\b(telegram|whatsapp|signal app)\b/i, { label: "Moves chat off-platform", detail: "Mentions Telegram/WhatsApp contact, a common scam tactic." }],
  [/\b(guaranteed income|earn \$?\d{3,}\s*(per|a) day|get rich|no experience.{0,20}\$\d{3,})/i, { label: "Unrealistic earnings claim", detail: "Promises unusually high or guaranteed pay." }],
  [/\b(crypto(currency)? payment|gift cards?|western union|money transfer)\b/i, { label: "Unusual payment method", detail: "Mentions crypto, gift cards or money transfers." }],
];

export function detectScamSignals(text: string): ScamSignal[] {
  return SCAM_PATTERNS.filter(([pattern]) => pattern.test(text)).map(([, signal]) => signal);
}

/** Fields shared by every remote job-board listing. */
export function remoteJobDefaults(): Pick<
  Opportunity,
  "city" | "workMode" | "startupCostZAR" | "dateDiscovered" | "lastChecked" | "isActive" | "weekend" | "evening"
> {
  const now = new Date().toISOString();
  return { city: null, workMode: "Remote", startupCostZAR: 0, dateDiscovered: now, lastChecked: now, isActive: true, weekend: false, evening: false };
}

const LINK_CHECK_TTL_MS = 10 * 60 * 1000;
const linkChecks = new Map<string, { live: boolean; checkedAt: number }>();

/**
 * Whether a job page is still up: not 404/410 and not redirected to the
 * site's home page (what job boards do when a post is removed). Network
 * errors and timeouts count as live so a slow site doesn't hide its jobs.
 * Results are remembered for 10 minutes (the refresh interval).
 */
async function isLinkLive(url: string): Promise<boolean> {
  const cached = linkChecks.get(url);
  if (cached && Date.now() - cached.checkedAt < LINK_CHECK_TTL_MS) return cached.live;
  let live = true;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      headers: { "user-agent": "Mozilla/5.0 (compatible; SideHustleFinder/1.0; link check)", accept: "text/html" },
      signal: AbortSignal.timeout(5000),
    });
    await res.body?.cancel();
    const landedOnHome = new URL(res.url).pathname.replace(/\/+$/, "") === "" && new URL(url).pathname.replace(/\/+$/, "") !== "";
    live = !(res.status === 404 || res.status === 410 || landedOnHome);
  } catch {
    live = true;
  }
  linkChecks.set(url, { live, checkedAt: Date.now() });
  return live;
}

/** Drops listings whose page has been removed. Checks run in parallel (up to 64 at once) so a full rebuild takes seconds. */
export async function keepLiveListings<T extends { sourceUrl: string | null }>(listings: T[]): Promise<T[]> {
  const live = new Array<boolean>(listings.length).fill(false);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(64, listings.length) }, async () => {
      for (let i = next++; i < listings.length; i = next++) {
        live[i] = listings[i].sourceUrl ? await isLinkLive(listings[i].sourceUrl!) : false;
      }
    }),
  );
  return listings.filter((_, i) => live[i]);
}

/** Keep only listings with a real http(s) link and a valid posting date. */
export function isUsable(o: Opportunity): boolean {
  return Boolean(o.sourceUrl && /^https?:\/\//.test(o.sourceUrl) && !Number.isNaN(new Date(o.datePosted).getTime()));
}
