import { getDb } from "@/lib/db";

export async function getSchoolProfile() {
  const prisma = await getDb();
  return (prisma as any).schoolProfile.findFirst();
}

export async function upsertSchoolProfile(input: Record<string, unknown>) {
  const { name, code, address, phone, email, website, motto, logo, currency, dateFormat, country, state, city, feeDueDays, onboardingCompleted } = input as any;
  const prisma = await getDb();
  const existing = await (prisma as any).schoolProfile.findFirst();

  // Allow onboarding-only update (no name required)
  if (onboardingCompleted !== undefined && !name) {
    if (!existing) throw Object.assign(new Error("No school profile found"), { code: "NOT_FOUND" });
    return (prisma as any).schoolProfile.update({
      where: { id: existing.id },
      data: { onboardingCompleted: Boolean(onboardingCompleted) },
    });
  }

  if (!name?.trim()) throw Object.assign(new Error("School name is required"), { code: "VALIDATION" });
  // Partial-update semantics: only touch fields the caller actually sent.
  // Writing `field || null` for absent keys silently wiped values saved
  // elsewhere — and nulling the NOT NULL currency/dateFormat columns made the
  // whole save 500 (which stalled the onboarding wizard with no error).
  const data: any = { name: (name as string).trim() };
  const optional: Record<string, unknown> = { code, address, phone, email, website, motto, logo, country, state, city };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) data[key] = value || null;
  }
  if (currency   !== undefined && currency)   data.currency   = currency;   // NOT NULL — never null out
  if (dateFormat !== undefined && dateFormat) data.dateFormat = dateFormat; // NOT NULL — never null out
  if (feeDueDays !== undefined) data.feeDueDays = feeDueDays ? parseInt(feeDueDays) : null;
  if (onboardingCompleted !== undefined) data.onboardingCompleted = Boolean(onboardingCompleted);
  if (existing) {
    return (prisma as any).schoolProfile.update({ where: { id: existing.id }, data });
  }
  return (prisma as any).schoolProfile.create({ data });
}
