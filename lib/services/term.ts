import { getDb } from "@/lib/db";

export interface CurrentTerm {
  id: string;
  name: string;
  termNumber: number;
  startDate: Date;
  endDate: Date;
  week: number;            // week within the term (1-based)
  schoolDaysLeft: number;  // weekdays from today to term end (inclusive)
}

/**
 * The term covering `today` for the active session — the unit schools plan in.
 * Prefers the term whose date range contains today; falls back to the flagged
 * `isCurrent` term so a school between terms still has context. Null if the
 * school hasn't set up terms (feature is opt-in).
 */
export async function getCurrentTerm(sessionId: string | null, today = new Date()): Promise<CurrentTerm | null> {
  if (!sessionId) return null;
  const db = await getDb();
  const terms = await (db as any).term
    .findMany({ where: { sessionId }, orderBy: { termNumber: "asc" } })
    .catch(() => []);
  if (!terms.length) return null;

  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const inRange = terms.find((t: any) => midnight >= new Date(t.startDate) && midnight <= new Date(t.endDate));
  const chosen = inRange ?? terms.find((t: any) => t.isCurrent) ?? null;
  if (!chosen) return null;

  const start = new Date(chosen.startDate);
  const end = new Date(chosen.endDate);
  const week = midnight >= start
    ? Math.max(1, Math.floor((midnight.getTime() - start.getTime()) / 86400000 / 7) + 1)
    : 1;

  let schoolDaysLeft = 0;
  for (let d = new Date(Math.max(midnight.getTime(), start.getTime())); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) schoolDaysLeft++;
  }

  return {
    id: chosen.id, name: chosen.name, termNumber: chosen.termNumber,
    startDate: start, endDate: end, week, schoolDaysLeft,
  };
}
