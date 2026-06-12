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
  const data: any = {
    name:       (name as string).trim(),
    code:       code       || null,
    address:    address    || null,
    phone:      phone      || null,
    email:      email      || null,
    website:    website    || null,
    motto:      motto      || null,
    logo:       logo       || null,
    currency:   currency   || null,
    dateFormat: dateFormat || null,
    country:    country    || null,
    state:      state      || null,
    city:       city       || null,
    feeDueDays: feeDueDays ? parseInt(feeDueDays) : null,
    ...(onboardingCompleted !== undefined && { onboardingCompleted: Boolean(onboardingCompleted) }),
  };
  if (existing) {
    return (prisma as any).schoolProfile.update({ where: { id: existing.id }, data });
  }
  return (prisma as any).schoolProfile.create({ data });
}
