"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import type { SideHustleIdea } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/categories";
import { IdeaCard } from "./IdeaCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function IdeaExplorer({ ideas }: { ideas: SideHustleIdea[] }) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [locationType, setLocationType] = useState("all");

  const categories = useMemo(
    () => ALL_CATEGORIES.filter((c) => ideas.some((i) => i.category === c)),
    [ideas],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return ideas.filter((idea) => {
      if (kw && !`${idea.title} ${idea.description} ${idea.skillsRequired.join(" ")}`.toLowerCase().includes(kw)) {
        return false;
      }
      if (category !== "all" && idea.category !== category) return false;
      if (difficulty !== "all" && idea.difficulty !== difficulty) return false;
      if (locationType !== "all" && idea.locationType !== locationType) return false;
      return true;
    });
  }, [ideas, keyword, category, difficulty, locationType]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-white p-4 shadow-sm sm:grid-cols-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search ideas..."
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:col-span-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">Any difficulty</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:col-span-4"
        >
          <option value="all">Online or local</option>
          <option value="Online">Online only</option>
          <option value="Local">Local only</option>
          <option value="Both">Online or local</option>
        </select>
      </div>

      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{filtered.length}</span> side hustle ideas
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="No ideas match your filters" description="Try a broader keyword or fewer filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
