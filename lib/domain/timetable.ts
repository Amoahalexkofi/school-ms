export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface TimetableSlot {
  id: string;
  sectionId: string;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  staffId?: string;
}

export interface TimetableConflict {
  slotIds: string[];
  reason: string;
}

const MAX_PERIODS = 10;

export function validateSlot(slot: TimetableSlot): void {
  if (!slot.sectionId) throw new Error("sectionId is required");
  if (slot.period < 1) throw new Error("period must be at least 1");
  if (slot.period > MAX_PERIODS) throw new Error(`period cannot exceed ${MAX_PERIODS}`);
}

export function hasTeacherConflict(
  slot: TimetableSlot,
  existing: TimetableSlot[],
  excludeId?: string
): boolean {
  if (!slot.staffId) return false;
  return existing.some(
    (s) =>
      s.id !== excludeId &&
      s.id !== slot.id &&
      s.staffId === slot.staffId &&
      s.day === slot.day &&
      s.period === slot.period
  );
}

export function detectConflicts(slots: TimetableSlot[]): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];

  // Check duplicate section/day/period
  const sectionPeriodSeen = new Map<string, string>();
  for (const slot of slots) {
    const key = `${slot.sectionId}|${slot.day}|${slot.period}`;
    if (sectionPeriodSeen.has(key)) {
      conflicts.push({
        slotIds: [sectionPeriodSeen.get(key)!, slot.id],
        reason: `Duplicate period ${slot.period} on ${slot.day} for section ${slot.sectionId}`,
      });
    } else {
      sectionPeriodSeen.set(key, slot.id);
    }
  }

  // Check teacher double-booking
  const teacherPeriodSeen = new Map<string, string>();
  for (const slot of slots) {
    if (!slot.staffId) continue;
    const key = `${slot.staffId}|${slot.day}|${slot.period}`;
    if (teacherPeriodSeen.has(key)) {
      conflicts.push({
        slotIds: [teacherPeriodSeen.get(key)!, slot.id],
        reason: `Teacher ${slot.staffId} is double-booked on ${slot.day} period ${slot.period}`,
      });
    } else {
      teacherPeriodSeen.set(key, slot.id);
    }
  }

  return conflicts;
}
