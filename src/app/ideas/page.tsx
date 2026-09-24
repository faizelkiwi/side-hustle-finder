import { SIDE_HUSTLE_IDEAS } from "@/lib/data/sideHustleIdeas";
import { IdeaExplorer } from "@/components/ideas/IdeaExplorer";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Side Hustle Ideas</h1>
        <p className="text-sm text-muted">
          A reference library of proven side hustle models - not live listings, but starting points you can act on today.
        </p>
      </div>
      <IdeaExplorer ideas={SIDE_HUSTLE_IDEAS} />
    </div>
  );
}
