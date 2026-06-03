import {
  calculateAttendancePercentage,
  getAttendanceSummary,
  isAttendanceBelowThreshold,
  type AttendanceRecord,
} from "@/lib/domain/attendance";

const makeRecords = (statuses: string[]): AttendanceRecord[] =>
  statuses.map((status, i) => ({
    date: new Date(`2025-06-${String(i + 1).padStart(2, "0")}`),
    status: status as AttendanceRecord["status"],
  }));

describe("calculateAttendancePercentage", () => {
  it("returns 100% when all days are present", () => {
    const records = makeRecords(["PRESENT", "PRESENT", "PRESENT"]);
    expect(calculateAttendancePercentage(records)).toBe(100);
  });

  it("returns 0% when all days are absent", () => {
    const records = makeRecords(["ABSENT", "ABSENT"]);
    expect(calculateAttendancePercentage(records)).toBe(0);
  });

  it("counts LATE as present", () => {
    const records = makeRecords(["PRESENT", "LATE", "ABSENT", "ABSENT"]);
    // 2 out of 4 school days = 50%
    expect(calculateAttendancePercentage(records)).toBe(50);
  });

  it("counts HALF_DAY as 0.5", () => {
    const records = makeRecords(["PRESENT", "HALF_DAY", "ABSENT"]);
    // 1 + 0.5 = 1.5 out of 3 = 50%
    expect(calculateAttendancePercentage(records)).toBe(50);
  });

  it("excludes HOLIDAY days from total count", () => {
    const records = makeRecords(["PRESENT", "PRESENT", "HOLIDAY"]);
    // 2 out of 2 school days = 100%
    expect(calculateAttendancePercentage(records)).toBe(100);
  });

  it("returns 0 for empty records", () => {
    expect(calculateAttendancePercentage([])).toBe(0);
  });

  it("rounds to two decimal places", () => {
    const records = makeRecords(["PRESENT", "ABSENT", "ABSENT"]);
    // 1 out of 3 = 33.33...%
    expect(calculateAttendancePercentage(records)).toBe(33.33);
  });
});

describe("getAttendanceSummary", () => {
  it("returns correct counts for each status", () => {
    const records = makeRecords([
      "PRESENT",
      "PRESENT",
      "ABSENT",
      "LATE",
      "HALF_DAY",
      "HOLIDAY",
    ]);
    const summary = getAttendanceSummary(records);
    expect(summary.present).toBe(2);
    expect(summary.absent).toBe(1);
    expect(summary.late).toBe(1);
    expect(summary.halfDay).toBe(1);
    expect(summary.holiday).toBe(1);
    expect(summary.totalSchoolDays).toBe(5); // holidays excluded
    // 2 present + 1 late + 0.5 half-day = 3.5 / 5 = 70%
    expect(summary.percentage).toBe(70);
  });

  it("returns zero summary for empty records", () => {
    const summary = getAttendanceSummary([]);
    expect(summary.present).toBe(0);
    expect(summary.absent).toBe(0);
    expect(summary.percentage).toBe(0);
    expect(summary.totalSchoolDays).toBe(0);
  });
});

describe("isAttendanceBelowThreshold", () => {
  it("returns true when attendance is below threshold", () => {
    const records = makeRecords(["PRESENT", "ABSENT", "ABSENT", "ABSENT"]);
    // 25% < 75% threshold
    expect(isAttendanceBelowThreshold(records, 75)).toBe(true);
  });

  it("returns false when attendance meets threshold", () => {
    const records = makeRecords(["PRESENT", "PRESENT", "PRESENT", "ABSENT"]);
    // 75% >= 75% threshold
    expect(isAttendanceBelowThreshold(records, 75)).toBe(false);
  });

  it("returns false for empty records (no data = no alert)", () => {
    expect(isAttendanceBelowThreshold([], 75)).toBe(false);
  });
});
