import { getDb } from "@/lib/db";

export async function getSchoolProfile() {
  const prisma = await getDb();
  return (prisma as any).schoolProfile.findFirst();
}

export async function upsertSchoolProfile(input: Record<string, unknown>) {
  const { name, code, address, phone, email, website, motto, logo, coverImage, currency, dateFormat, country, state, city, feeDueDays, onboardingCompleted, latitude, longitude, geofenceRadius } = input as any;
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
  const optional: Record<string, unknown> = { code, address, phone, email, website, motto, logo, coverImage, country, state, city };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) data[key] = value || null;
  }
  if (currency   !== undefined && currency)   data.currency   = currency;   // NOT NULL — never null out
  if (dateFormat !== undefined && dateFormat) data.dateFormat = dateFormat; // NOT NULL — never null out
  if (feeDueDays !== undefined) data.feeDueDays = feeDueDays ? parseInt(feeDueDays) : null;
  // Geofence coords: use ?? not || — a school genuinely at 0° lat/long (rare
  // but not impossible) must not get silently nulled out.
  // parseFloat("garbage") is NaN, and Postgres float8 happily stores NaN —
  // it doesn't throw, it just silently corrupts the value (and the geofence
  // check's own `== null` guard doesn't catch NaN, so a bad save here can
  // disable the geofence entirely). Anything that doesn't parse to a real
  // finite number is treated the same as "not set" — never written as NaN.
  if (latitude !== undefined) {
    const n = latitude === "" || latitude === null ? null : parseFloat(latitude);
    data.latitude = n != null && Number.isFinite(n) ? n : null;
  }
  if (longitude !== undefined) {
    const n = longitude === "" || longitude === null ? null : parseFloat(longitude);
    data.longitude = n != null && Number.isFinite(n) ? n : null;
  }
  if (geofenceRadius !== undefined) data.geofenceRadius = geofenceRadius ? parseInt(geofenceRadius) : 150;
  if (onboardingCompleted !== undefined) data.onboardingCompleted = Boolean(onboardingCompleted);
  if (existing) {
    return (prisma as any).schoolProfile.update({ where: { id: existing.id }, data });
  }
  return (prisma as any).schoolProfile.create({ data });
}
