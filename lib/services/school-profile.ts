import { prisma } from "@/lib/prisma";

export async function getSchoolProfile() {
  return (prisma as any).schoolProfile.findFirst();
}

export async function upsertSchoolProfile(input: {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  motto?: string;
  website?: string;
}) {
  if (!input.name.trim()) throw Object.assign(new Error("School name is required"), { code: "VALIDATION" });
  const existing = await (prisma as any).schoolProfile.findFirst();
  if (existing) {
    return (prisma as any).schoolProfile.update({ where: { id: existing.id }, data: input });
  }
  return (prisma as any).schoolProfile.create({ data: input });
}
