import { getDb } from "@/lib/db";
import { parseCoordinate } from "@/lib/geofence";

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
  // Geofence coords accept decimal degrees or DMS ("5°35'14.1\"N") via
  // parseCoordinate — never plain parseFloat, which silently truncates a DMS
  // string to its leading digit (a "valid" number pointing miles away) rather
  // than rejecting it. An unparseable non-empty value throws instead of
  // silently saving something wrong.
  if (latitude !== undefined) {
    if (latitude === "" || latitude === null) data.latitude = null;
    else {
      const n = parseCoordinate(String(latitude));
      if (n == null) throw Object.assign(new Error(`Latitude "${latitude}" isn't a valid coordinate — use decimal degrees (e.g. 5.6037) or DMS (e.g. 5°35'14.1"N).`), { code: "VALIDATION" });
      data.latitude = n;
    }
  }
  if (longitude !== undefined) {
    if (longitude === "" || longitude === null) data.longitude = null;
    else {
      const n = parseCoordinate(String(longitude));
      if (n == null) throw Object.assign(new Error(`Longitude "${longitude}" isn't a valid coordinate — use decimal degrees (e.g. -0.1870) or DMS (e.g. 0°11'31.3"W).`), { code: "VALIDATION" });
      data.longitude = n;
    }
  }
  if (geofenceRadius !== undefined) data.geofenceRadius = geofenceRadius ? parseInt(geofenceRadius) : 150;
  if (onboardingCompleted !== undefined) data.onboardingCompleted = Boolean(onboardingCompleted);
  if (existing) {
    return (prisma as any).schoolProfile.update({ where: { id: existing.id }, data });
  }
  return (prisma as any).schoolProfile.create({ data });
}
