// Demo data uses relative dates so "posted today / this week" always works
// no matter when the app is opened.

export function daysAgo(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours, d.getMinutes(), 0, 0);
  return d.toISOString();
}

export function now(): string {
  return new Date().toISOString();
}
