// Core domain types for Side Hustle Finder.
// Kept independent of any single data source so every job-board connector
// maps into the same shape.

export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type PaymentType =
  | "Hourly"
  | "Fixed Fee"
  | "Commission"
  | "Project-Based"
  | "Salary";

export type ExperienceLevel =
  | "No Experience Required"
  | "Entry Level"
  | "Intermediate"
  | "Experienced";

export type StartupCostTier =
  | "Free to Start"
  | "Very Low Cost"
  | "Low Cost"
  | "Moderate Cost"
  | "High Cost";

export type RiskLevel = "Low Risk" | "Review Carefully" | "High Risk";

export type OpportunityCategory =
  | "Remote Part-Time Jobs"
  | "Freelance Work"
  | "Virtual Assistant"
  | "Data Entry"
  | "Customer Service"
  | "Social Media Management"
  | "Affiliate Marketing"
  | "Online Tutoring"
  | "Content Writing"
  | "Graphic Design"
  | "Website Testing"
  | "User Testing"
  | "Transcription"
  | "AI-Related Freelance Work"
  | "Digital Products"
  | "Print-on-Demand"
  | "Online Surveys"
  | "Microtasks"
  | "Delivery / Driving"
  | "Weekend Work"
  | "Evening Jobs"
  | "Temporary Work"
  | "Consulting"
  | "Administrative Work"
  | "Automotive Side Jobs"
  | "Remote Jobs"
  | "Other";

export interface ScamSignal {
  label: string;
  detail: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  category: OpportunityCategory;
  description: string;
  country: string;
  city: string | null;
  workMode: WorkMode;
  earningPotential: string; // human readable, e.g. "R80 - R150 / hour"
  earningPotentialMonthlyZAR: [number, number]; // normalized range for sorting/filters
  paymentType: PaymentType;
  startupCostZAR: number;
  experienceLevel: ExperienceLevel;
  skills: string[];
  datePosted: string; // ISO date
  dateDiscovered: string; // ISO date
  lastChecked: string; // ISO date
  isActive: boolean;
  sourceName: string;
  sourceUrl: string | null; // null when there is no verified public page to link to
  trustScore: number; // 0-100, quality/reliability of the source
  scamSignals: ScamSignal[];
  partTime: boolean;
  weekend: boolean;
  evening: boolean;
  freelance: boolean;
  contract: boolean;
}

export interface EnrichedOpportunity extends Opportunity {
  startupCostTier: StartupCostTier;
  riskLevel: RiskLevel;
  opportunityScore: number; // 0-100
}

export type OpportunityStatus =
  | "Interested"
  | "Applied"
  | "Interview"
  | "Accepted"
  | "Rejected"
  | "Archived";

/** What's kept about a saved listing so it still shows after it leaves the live feed. */
export interface SavedOpportunitySnapshot {
  title: string;
  company: string;
  sourceName: string;
}

export interface SavedOpportunityMeta {
  opportunityId: string;
  snapshot?: SavedOpportunitySnapshot;
  savedAt: string;
  status: OpportunityStatus;
  notes: string;
  applicationDate: string | null;
  expectedEarnings: string;
  actualEarnings: string;
}

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface SideHustleIdea {
  id: string;
  title: string;
  category: OpportunityCategory;
  description: string;
  skillsRequired: string[];
  startupCostZAR: [number, number];
  timeCommitment: string;
  incomeRangeZAR: string;
  difficulty: Difficulty;
  locationType: "Online" | "Local" | "Both";
  stepsToStart: string[];
  recommendedTools: string[];
  potentialRisks: string[];
}

export interface DataSource {
  id: string;
  name: string;
  type: "API" | "RSS" | "Manual" | "Partner Feed";
  status: "Active" | "Disabled" | "Error";
  opportunitiesImported: number;
  lastSuccessfulImport: string | null;
  lastError: string | null;
}

export type Currency = "ZAR" | "USD" | "GBP" | "EUR";

export interface AppSettings {
  currency: Currency;
  startupCostThresholdZAR: number;
  preferredLocation: string;
  notifyEmail: boolean;
  notifyWhatsApp: boolean;
  notifyBrowser: boolean;
}
