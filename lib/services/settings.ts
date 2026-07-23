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
  const where: any = { isActive: true };
  if (classId)   where.classId   = classId;
  if (sessionId) where.sessionId = sessionId;
  const prisma = await getDb();
  return (prisma as any).subject.findMany({
    where,
    include: { class: true },
    orderBy: { name: "asc" },
  });
}

export async function createSubject(input: { name: string; code: string; classId: string; sessionId?: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Subject name is required"), { code: "VALIDATION" });
  if (!input.code.trim()) throw Object.assign(new Error("Subject code is required"), { code: "VALIDATION" });
  if (!input.classId) throw Object.assign(new Error("Class is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  // Subject.sessionId is required — default to the active academic session.
  let sessionId = input.sessionId;
  if (!sessionId) {
    const session = await (prisma as any).academicSession.findFirst({
      where: { isActive: true },
      orderBy: { startDate: "desc" },
    });
    if (!session) throw Object.assign(new Error("No active academic session. Create one first."), { code: "VALIDATION" });
    sessionId = session.id;
  }
  return (prisma as any).subject.create({
    data: { name: input.name.trim(), code: input.code.trim().toUpperCase(), classId: input.classId, sessionId },
  });
}

export async function updateSubject(id: string, input: { name?: string; code?: string }) {
  const data: any = {};
  if (input.name !== undefined) {
    if (!input.name.trim()) throw Object.assign(new Error("Subject name is required"), { code: "VALIDATION" });
    data.name = input.name.trim();
  }
  if (input.code !== undefined) {
    if (!input.code.trim()) throw Object.assign(new Error("Subject code is required"), { code: "VALIDATION" });
    data.code = input.code.trim().toUpperCase();
  }
  const prisma = await getDb();
  return (prisma as any).subject.update({ where: { id }, data });
}

export async function deleteSubject(id: string) {
  const prisma = await getDb();
  return (prisma as any).subject.update({ where: { id }, data: { isActive: false } });
}

export async function updateClass(id: string, input: { name: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Class name is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).class.update({ where: { id }, data: { name: input.name.trim() } });
}

export async function deleteClass(id: string) {
  const prisma = await getDb();
  return (prisma as any).class.update({ where: { id }, data: { isActive: false } });
}

export async function updateSection(id: string, input: { name: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Section name is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).section.update({ where: { id }, data: { name: input.name.trim() } });
}

export async function deleteSection(id: string) {
  const prisma = await getDb();
  return (prisma as any).section.update({ where: { id }, data: { isActive: false } });
}
