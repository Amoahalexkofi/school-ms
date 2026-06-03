export interface AdmissionContext {
  sessionYear: number;
  sequenceNumber: number;
}

export function generateAdmissionNumber(
  ctx: AdmissionContext,
  prefix = "ADM"
): string {
  if (ctx.sessionYear < 2000 || ctx.sessionYear > 2100) {
    throw new Error("invalid sessionYear");
  }
  if (ctx.sequenceNumber < 1) {
    throw new Error("sequenceNumber must be at least 1");
  }
  const seq =
    ctx.sequenceNumber < 10000
      ? String(ctx.sequenceNumber).padStart(4, "0")
      : String(ctx.sequenceNumber);
  return `${prefix}-${ctx.sessionYear}-${seq}`;
}

export function validateStudentAge(dateOfBirth: Date, today: Date): void {
  if (dateOfBirth > today) {
    throw new Error("date of birth cannot be in the future");
  }

  const ageMs = today.getTime() - dateOfBirth.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

  if (ageYears < 3) {
    throw new Error("student must be at least 3 years old");
  }
  if (ageYears > 25) {
    throw new Error("student cannot be older than 25");
  }
}

function toTitleCase(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function formatStudentName(
  firstName: string,
  lastName: string
): { firstName: string; lastName: string } {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!first) throw new Error("firstName is required");
  if (!last) throw new Error("lastName is required");
  return { firstName: toTitleCase(first), lastName: toTitleCase(last) };
}
