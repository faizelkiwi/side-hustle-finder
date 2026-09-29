"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, CheckCircle2, MinusCircle } from "lucide-react";
import { suggestForBudget, type BudgetInput } from "@/lib/budget";
import { CategoryBadge } from "@/components/ui/Badges";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";

const DEFAULT_INPUT: BudgetInput = {
  startupBudgetZAR: 500,
  hoursPerWeek: 10,
  desiredMonthlyIncomeZAR: 5000,
};

export function BudgetCalculatorClient() {
  const [input, setInput] = useState<BudgetInput>(DEFAULT_INPUT);
  const [calculated, setCalculated] = useState(false);

  const results = calculated ? suggestForBudget(input) : [];

  function update<K extends keyof BudgetInput>(key: K, value: BudgetInput[K]) {
    setInput((i) => ({ ...i, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Calculator size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Side Hustle Budget Calculator</h1>
          <p className="text-sm text-muted">Enter your budget, time, and goals to see which side hustles are realistic.</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCalculated(true);
        }}
        className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-white p-5 shadow-sm sm:grid-cols-3"
      >
        <div>
          <label className="text-xs font-medium text-muted">Available startup budget (R)</label>
          <input
            type="number"
            min={0}
            step={50}
            value={input.startupBudgetZAR}
            onChange={(e) => update("startupBudgetZAR", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Hours available / week</label>
          <input
            type="number"
            min={1}
            value={input.hoursPerWeek}
            onChange={(e) => update("hoursPerWeek", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Desired monthly income (R)</label>
          <input
            type="number"
            min={0}
            step={500}
            value={input.desiredMonthlyIncomeZAR}
            onChange={(e) => update("desiredMonthlyIncomeZAR", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="sm:col-span-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Calculator size={15} />
            Calculate
          </button>
        </div>
      </form>

      {calculated && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">{results.length}</span> side hustles fit your parameters
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.map(({ idea, fitsBudget, feasibilityNote }) => (
              <div key={idea.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <CategoryBadge category={idea.category} />
                    <DifficultyBadge level={idea.difficulty} />
                  </div>
                  {fitsBudget ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700 ring-1 ring-inset ring-success-500/20">
                      <CheckCircle2 size={12} /> In budget
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300/40">
                      <MinusCircle size={12} /> Above budget
                    </span>
                  )}
                </div>
                <Link href={`/ideas/${idea.id}`} className="mt-2 block text-sm font-semibold text-foreground hover:text-brand-600">
                  {idea.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  R{idea.startupCostZAR[0].toLocaleString()} - R{idea.startupCostZAR[1].toLocaleString()} to start ·{" "}
                  {idea.incomeRangeZAR}
                </p>
                <p className="mt-2 text-xs text-gray-600">{feasibilityNote}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
