import {
  detectConflicts,
  hasTeacherConflict,
  validateSlot,
  type TimetableSlot,
} from "@/lib/domain/timetable";

const slot = (
  id: string,
  sectionId: string,
  day: TimetableSlot["day"],
  period: number,
  staffId?: string
): TimetableSlot => ({ id, sectionId, day, period, startTime: "08:00", endTime: "08:45", staffId });

describe("validateSlot", () => {
  it("passes for a valid slot", () => {
    expect(() => validateSlot(slot("1", "sec-A", "MONDAY", 1, "t1"))).not.toThrow();
  });

  it("throws when period is less than 1", () => {
    expect(() => validateSlot(slot("1", "sec-A", "MONDAY", 0))).toThrow("period must be at least 1");
  });

  it("throws when period exceeds maximum (10)", () => {
    expect(() => validateSlot(slot("1", "sec-A", "MONDAY", 11))).toThrow("period cannot exceed 10");
  });

  it("throws when sectionId is empty", () => {
    expect(() => validateSlot(slot("1", "", "MONDAY", 1))).toThrow("sectionId is required");
  });
});

describe("hasTeacherConflict", () => {
  const existing: TimetableSlot[] = [
    slot("1", "sec-A", "MONDAY", 1, "teacher-1"),
    slot("2", "sec-B", "MONDAY", 2, "teacher-1"),
    slot("3", "sec-C", "TUESDAY", 1, "teacher-2"),
  ];

  it("returns false when teacher has no conflict", () => {
    const newSlot = slot("4", "sec-D", "MONDAY", 3, "teacher-1");
    expect(hasTeacherConflict(newSlot, existing)).toBe(false);
  });

  it("returns true when teacher is already assigned same day/period in another section", () => {
    const newSlot = slot("4", "sec-D", "MONDAY", 1, "teacher-1");
    expect(hasTeacherConflict(newSlot, existing)).toBe(true);
  });

  it("returns false when same day/period but different teacher", () => {
    const newSlot = slot("4", "sec-D", "MONDAY", 1, "teacher-3");
    expect(hasTeacherConflict(newSlot, existing)).toBe(false);
  });

  it("returns false when slot has no teacher assigned", () => {
    const newSlot = slot("4", "sec-D", "MONDAY", 1);
    expect(hasTeacherConflict(newSlot, existing)).toBe(false);
  });

  it("ignores the slot itself when checking (for updates)", () => {
    const updateSlot = slot("1", "sec-A", "MONDAY", 1, "teacher-1");
    expect(hasTeacherConflict(updateSlot, existing, "1")).toBe(false);
  });
});

describe("detectConflicts", () => {
  it("returns an empty array when there are no conflicts", () => {
    const slots: TimetableSlot[] = [
      slot("1", "sec-A", "MONDAY", 1, "teacher-1"),
      slot("2", "sec-A", "MONDAY", 2, "teacher-2"),
      slot("3", "sec-B", "MONDAY", 1, "teacher-3"),
    ];
    expect(detectConflicts(slots)).toHaveLength(0);
  });

  it("detects a teacher double-booked in the same period", () => {
    const slots: TimetableSlot[] = [
      slot("1", "sec-A", "MONDAY", 1, "teacher-1"),
      slot("2", "sec-B", "MONDAY", 1, "teacher-1"), // conflict
      slot("3", "sec-C", "MONDAY", 2, "teacher-1"),
    ];
    const conflicts = detectConflicts(slots);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].slotIds).toContain("1");
    expect(conflicts[0].slotIds).toContain("2");
    expect(conflicts[0].reason).toMatch(/teacher-1/);
  });

  it("detects duplicate section/day/period assignment", () => {
    const slots: TimetableSlot[] = [
      slot("1", "sec-A", "MONDAY", 1, "teacher-1"),
      slot("2", "sec-A", "MONDAY", 1, "teacher-2"), // duplicate period in same section
    ];
    const conflicts = detectConflicts(slots);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toMatch(/duplicate/i);
  });

  it("detects multiple conflicts", () => {
    const slots: TimetableSlot[] = [
      slot("1", "sec-A", "MONDAY", 1, "teacher-1"),
      slot("2", "sec-B", "MONDAY", 1, "teacher-1"), // teacher conflict
      slot("3", "sec-A", "MONDAY", 1, "teacher-2"), // duplicate section period
    ];
    const conflicts = detectConflicts(slots);
    expect(conflicts.length).toBeGreaterThanOrEqual(2);
  });

  it("returns empty array for empty slot list", () => {
    expect(detectConflicts([])).toHaveLength(0);
  });
});
