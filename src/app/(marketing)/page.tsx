import Link from "next/link";
import {
  Briefcase,
  ShieldCheck,
  Search,
  Sparkles,
  Bookmark,
  Bell,
  Calculator,
  Check,
  ArrowRight,
} from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";
import { HeaderActions } from "@/components/marketing/HeaderActions";

export const metadata = {
  title: "Side Hustle Finder · Find legitimate side hustles in South Africa",
  description:
    "Discover legitimate, low-cost side hustles and part-time work. Scam-risk scoring, earnings estimates and an application tracker in one dashboard.",
};

const FEATURES = [
  {
    icon: Search,
    title: "Every opportunity in one place",
    body: "Remote, local and freelance work from trusted South African and global job boards, filtered by cost, hours and location.",
  },
  {
    icon: ShieldCheck,
    title: "Scam-risk scoring",
    body: "Each listing is checked for common scam signals, like upfront fees or unrealistic pay, so you know what to avoid.",
  },
  {
    icon: Bookmark,
    title: "Track your applications",
    body: "Save opportunities, move them from Interested to Applied to Accepted, and note what you expect to earn.",
  },
  {
    icon: Sparkles,
    title: "AI Opportunity Assistant",
    body: "Describe your skills, hours and budget and get matched to side hustles that suit you.",
  },
  {
    icon: Calculator,
    title: "Budget calculator",
    body: "See what a side hustle costs to start and how long it takes to pay for itself before you commit.",
  },
  {
    icon: Bell,
    title: "Daily alerts",
    body: "A fresh feed of new opportunities every day, so you're first in line.",
  },
];

const STEPS = [
  { title: "Create a free account", body: "Sign up in seconds with Google or your email." },
  { title: "Find what fits", body: "Filter by startup cost, hours, remote or local, and scam risk." },
  { title: "Apply and track", body: "Save the best ones and track every application to the finish." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Briefcase size={16} />
            </div>
            <span className="text-sm font-semibold text-foreground sm:text-base">Side Hustle Finder</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <HeaderActions />
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-brand-50 to-white">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
              <ShieldCheck size={14} /> Legitimate opportunities, scam-checked
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find a side hustle that actually pays, without the scams.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
              Side Hustle Finder brings together real part-time, freelance and remote work, scores each one for risk and
              earning potential, and helps you track every application in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Start free <ArrowRight size={16} />
              </Link>
              <a href="#pricing" className="rounded-lg px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                See pricing
              </a>
            </div>
            <p className="mt-3 text-xs text-muted">Free forever plan · No card needed</p>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">Everything you need to earn on the side</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-background">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">How it works</h2>
            <ol className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">Simple pricing</h2>
          <p className="mt-2 text-center text-sm text-muted">Start free. Upgrade when you&apos;re ready to go further.</p>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {(Object.keys(PLANS) as PlanId[]).map((id) => {
              const plan = PLANS[id];
              const featured = id === "pro";
              return (
                <div
                  key={id}
                  className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${featured ? "border-brand-500 ring-1 ring-brand-500" : "border-border"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    {featured && (
                      <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">Most popular</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                  <p className="mt-5">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>{" "}
                    <span className="text-sm text-muted">{plan.cadence}</span>
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5 text-sm text-gray-700">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={16} className="mt-0.5 shrink-0 text-success-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={featured ? "/signup?next=/billing" : "/signup"}
                    className={`mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
                      featured ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-border text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {featured ? "Start with Pro" : "Start free"}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Side Hustle Finder</p>
          <p>Scores are guidance only. Always verify an opportunity before paying money or sharing personal information.</p>
        </div>
      </footer>
    </div>
  );
}
