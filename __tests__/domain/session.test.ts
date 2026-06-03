import {
  validateSessionDates,
  hasSessionOverlap,
  getActiveSession,
  type SessionInput,
} from "@/lib/domain/session";

const makeSession = (
  id: string,
  start: string,
  end: string,
  isActive = false
): SessionInput => ({
  id,
  name: `Session ${id}`,
  startDate: new Date(start),
  endDate: new Date(end),
  isActive,
});

describe("validateSessionDates", () => {
  it("passes for valid start and end dates", () => {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 11);
    expect(() => validateSessionDates(start, end)).not.toThrow();
  });

  it("throws when endDate is before startDate", () => {
    expect(() =>
      validateSessionDates(new Date("2025-12-31"), new Date("2025-01-01"))
    ).toThrow("endDate must be after startDate");
  });

  it("throws when endDate equals startDate", () => {
    expect(() =>
      validateSessionDates(new Date("2025-06-01"), new Date("2025-06-01"))
    ).toThrow("endDate must be after startDate");
  });

  it("throws when startDate is in the past by more than 1 year", () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() - 1);
    expect(() =>
      validateSessionDates(twoYearsAgo, oneYearAgo)
    ).toThrow("startDate cannot be more than 1 year in the past");
  });
});

describe("hasSessionOverlap", () => {
  const existing = [
    makeSession("s1", "2025-01-01", "2025-12-31"),
    makeSession("s2", "2026-01-01", "2026-12-31"),
  ];

  it("returns false when new session does not overlap any existing", () => {
    const newSession = makeSession("s3", "2027-01-01", "2027-12-31");
    expect(hasSessionOverlap(newSession, existing)).toBe(false);
  });

  it("returns true when new session fully overlaps an existing one", () => {
    const newSession = makeSession("s3", "2025-03-01", "2025-09-30");
    expect(hasSessionOverlap(newSession, existing)).toBe(true);
  });

  it("returns true when new session starts inside an existing one", () => {
    const newSession = makeSession("s3", "2025-06-01", "2026-06-30");
    expect(hasSessionOverlap(newSession, existing)).toBe(true);
  });

  it("returns true when new session ends inside an existing one", () => {
    const newSession = makeSession("s3", "2024-06-01", "2025-06-30");
    expect(hasSessionOverlap(newSession, existing)).toBe(true);
  });

  it("returns false when sessions are adjacent (no gap required)", () => {
    // s1 ends 2025-12-31, new starts 2026-01-01 — no overlap
    const newSession = makeSession("s3", "2026-01-01", "2026-12-31");
    // s2 already occupies that range, so we check against a different new session
    const adjacent = makeSession("s3", "2024-01-01", "2024-12-31");
    expect(hasSessionOverlap(adjacent, existing)).toBe(false);
  });

  it("excludes the session itself when checking (for updates)", () => {
    const updatedS1 = makeSession("s1", "2025-02-01", "2025-11-30");
    expect(hasSessionOverlap(updatedS1, existing, "s1")).toBe(false);
  });
});

describe("getActiveSession", () => {
  it("returns the active session", () => {
    const sessions = [
      makeSession("s1", "2024-01-01", "2024-12-31", false),
      makeSession("s2", "2025-01-01", "2025-12-31", true),
    ];
    const active = getActiveSession(sessions);
    expect(active?.id).toBe("s2");
  });

  it("returns null when no session is active", () => {
    const sessions = [
      makeSession("s1", "2024-01-01", "2024-12-31", false),
    ];
    expect(getActiveSession(sessions)).toBeNull();
  });

  it("returns the first active session when multiple are marked active (data inconsistency)", () => {
    const sessions = [
      makeSession("s1", "2024-01-01", "2024-12-31", true),
      makeSession("s2", "2025-01-01", "2025-12-31", true),
    ];
    expect(getActiveSession(sessions)?.id).toBe("s1");
  });

  it("returns null for empty list", () => {
    expect(getActiveSession([])).toBeNull();
  });
});
