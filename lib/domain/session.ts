export interface SessionInput {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export function validateSessionDates(startDate: Date, endDate: Date): void {
  if (endDate <= startDate) {
    throw new Error("endDate must be after startDate");
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (startDate < oneYearAgo) {
    throw new Error("startDate cannot be more than 1 year in the past");
  }
}

export function hasSessionOverlap(
  session: SessionInput,
  existing: SessionInput[],
  excludeId?: string
): boolean {
  return existing.some((s) => {
    if (s.id === excludeId) return false;
    if (s.id === session.id) return false;
    return session.startDate < s.endDate && session.endDate > s.startDate;
  });
}

export function getActiveSession(sessions: SessionInput[]): SessionInput | null {
  return sessions.find((s) => s.isActive) ?? null;
}
