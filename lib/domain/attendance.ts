export type AttendanceStatusValue =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "HOLIDAY";

export interface AttendanceRecord {
  date: Date;
  status: AttendanceStatusValue;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  holiday: number;
  totalSchoolDays: number;
  percentage: number;
}

function effectiveDaysPresent(records: AttendanceRecord[]): number {
  return records.reduce((acc, r) => {
    if (r.status === "PRESENT" || r.status === "LATE") return acc + 1;
    if (r.status === "HALF_DAY") return acc + 0.5;
    return acc;
  }, 0);
}

function totalSchoolDays(records: AttendanceRecord[]): number {
  return records.filter((r) => r.status !== "HOLIDAY").length;
}

export function calculateAttendancePercentage(
  records: AttendanceRecord[]
): number {
  if (records.length === 0) return 0;
  const schoolDays = totalSchoolDays(records);
  if (schoolDays === 0) return 0;
  const present = effectiveDaysPresent(records);
  return Math.round((present / schoolDays) * 100 * 100) / 100;
}

export function getAttendanceSummary(
  records: AttendanceRecord[]
): AttendanceSummary {
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const halfDay = records.filter((r) => r.status === "HALF_DAY").length;
  const holiday = records.filter((r) => r.status === "HOLIDAY").length;
  const schoolDays = totalSchoolDays(records);
  const percentage = calculateAttendancePercentage(records);

  return { present, absent, late, halfDay, holiday, totalSchoolDays: schoolDays, percentage };
}

export function isAttendanceBelowThreshold(
  records: AttendanceRecord[],
  thresholdPercentage: number
): boolean {
  if (records.length === 0) return false;
  return calculateAttendancePercentage(records) < thresholdPercentage;
}
