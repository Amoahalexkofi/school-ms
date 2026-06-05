import { getDb } from "@/lib/db";

export async function getSchoolProfile() {
  const prisma = await getDb();
  return (prisma as any).schoolProfile.findFirst();
}

export async function upsertSchoolProfile(input: {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  motto?: string;
  logo?: string;
  currency?: string;
  dateFormat?: string;
  country?: string;
  state?: string;
  city?: string;
  feeDueDays?: number;
}) {
  if (!input.name?.trim()) throw Object.assign(new Error("School name is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  const existing = await (prisma as any).schoolProfile.findFirst();
  if (existing) {
    return (prisma as any).schoolProfile.update({ where: { id: existing.id }, data: input });
  }
  return (prisma as any).schoolProfile.create({ data: input });
}
