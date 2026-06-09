import { getDb } from "@/lib/db";

export async function listSessions() {
  const prisma = await getDb();
  return (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } });
}

export async function createSession(input: { name: string; startDate: Date; endDate: Date }) {
  if (!input.name.trim()) throw Object.assign(new Error("Name is required"), { code: "VALIDATION" });
  if (input.endDate <= input.startDate) throw Object.assign(new Error("End date must be after start date"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).academicSession.create({ data: { session: input.name.trim(), startDate: input.startDate, endDate: input.endDate } });
}

export async function setActiveSession(sessionId: string) {
  const prisma = await getDb();
  await (prisma as any).academicSession.updateMany({ data: { isActive: false } });
  return (prisma as any).academicSession.update({ where: { id: sessionId }, data: { isActive: true } });
}

export async function listClasses(_sessionId?: string) {
  const prisma = await getDb();
  return (prisma as any).class.findMany({
    where: { isActive: true },
    include: { classSections: { include: { section: true } }, subjects: true },
    orderBy: { name: "asc" },
  });
}

export async function createClass(input: { name: string; sessionId?: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Class name is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).class.create({ data: { name: input.name.trim() } });
}

export async function createSection(input: { name: string; classId?: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Section name is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  // Section is standalone; link to a class via ClassSection if classId provided
  const section = await (prisma as any).section.create({ data: { name: input.name.trim() } });
  if (input.classId) {
    await (prisma as any).classSection.upsert({
      where: { classId_sectionId: { classId: input.classId, sectionId: section.id } },
      create: { classId: input.classId, sectionId: section.id },
      update: {},
    });
  }
  return section;
}

export async function listSubjects(classId?: string, sessionId?: string) {
  const where: any = {};
  if (classId)   where.classId   = classId;
  if (sessionId) where.sessionId = sessionId;
  const prisma = await getDb();
  return (prisma as any).subject.findMany({
    where,
    include: { class: true },
    orderBy: { name: "asc" },
  });
}

export async function createSubject(input: { name: string; code: string; classId: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Subject name is required"), { code: "VALIDATION" });
  if (!input.code.trim()) throw Object.assign(new Error("Subject code is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).subject.create({ data: { name: input.name.trim(), code: input.code.trim().toUpperCase(), classId: input.classId } });
}
