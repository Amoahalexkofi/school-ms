import { getDb } from "@/lib/db";

export async function listApplications(status?: string) {
  const where = status ? { status } : {};
  const prisma = await getDb();
  return (prisma as any).admissionApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function submitApplication(input: {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  classAppliedFor: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address?: string;
  notes?: string;
}) {
  if (!input.firstName.trim()) throw Object.assign(new Error("First name is required"), { code: "VALIDATION" });
  if (!input.lastName.trim()) throw Object.assign(new Error("Last name is required"), { code: "VALIDATION" });
  if (!input.parentName.trim()) throw Object.assign(new Error("Parent name is required"), { code: "VALIDATION" });
  if (!input.parentPhone.trim()) throw Object.assign(new Error("Parent phone is required"), { code: "VALIDATION" });
  if (!input.classAppliedFor.trim()) throw Object.assign(new Error("Class is required"), { code: "VALIDATION" });

  const prisma = await getDb();
  return (prisma as any).admissionApplication.create({
    data: {
      firstName:       input.firstName.trim(),
      lastName:        input.lastName.trim(),
      dateOfBirth:     input.dateOfBirth,
      gender:          input.gender,
      classAppliedFor: input.classAppliedFor.trim(),
      parentName:      input.parentName.trim(),
      parentPhone:     input.parentPhone.trim(),
      parentEmail:     input.parentEmail  || null,
      address:         input.address      || null,
      notes:           input.notes        || null,
    },
  });
}

export async function reviewApplication(
  id: string,
  status: "REVIEWED" | "APPROVED" | "REJECTED",
  reviewNote?: string,
) {
  const prisma = await getDb();
  const app = await (prisma as any).admissionApplication.findUnique({ where: { id } });
  if (!app) throw Object.assign(new Error("Application not found"), { code: "NOT_FOUND" });
  return (prisma as any).admissionApplication.update({ where: { id }, data: { status, reviewNote } });
}
