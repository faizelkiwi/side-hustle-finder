// Dates are shown in South African time everywhere. Without a fixed zone,
// server-rendered pages would use the host's clock (UTC on Vercel).
export const APP_TIME_ZONE = "Africa/Johannesburg";

/** "29 Sept 2026" (or "29 September 2026" with month: "long") in South African time. */
export function formatDate(iso: string, month: "short" | "long" = "short"): string {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month, year: "numeric", timeZone: APP_TIME_ZONE });
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return formatDate(iso);
}

/**
 * Returns the URL only if it is a well-formed http(s) link, so the UI never
 * renders an "Apply / View" button that leads nowhere.
 */
export function getExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  });
}

export type DateOrder = "newest" | "oldest";

/**
 * Sorts by posted date (newest or oldest first). Ties fall back to id so the
 * order is stable across refreshes.
 */
export function sortByPostedDate<T extends { datePosted: string; id: string }>(items: T[], order: DateOrder = "newest"): T[] {
  const direction = order === "newest" ? -1 : 1;
  return [...items].sort((a, b) => {
    const diff = new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
    return diff !== 0 ? diff * direction : a.id.localeCompare(b.id);
  });
}

/** Posted within the last 24 hours. */
export function isNew(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;
}

export function isWithinDays(iso: string, days: number): boolean {
  const diffMs = Date.now() - new Date(iso).getTime();
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  );
}
