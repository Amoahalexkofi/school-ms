import { getDb } from "@/lib/db";

// Student self-service: mark as done, optionally attaching a submitted file
// (Smart School: Homework::upload_docs / status "submitted"). Acknowledging
// with no attachment just confirms the student has seen it.
export async function acknowledgeHomework(homeworkId: string, studentId: string, attachment?: string) {
  const prisma = await getDb();
  const hw = await (prisma as any).homework.findUnique({ where: { id: homeworkId } });
  if (!hw) throw new Error("homework not found");

  const data: Record<string, unknown> = { acknowledged: true };
  if (attachment) { data.attachment = attachment; data.submittedAt = new Date(); }

  return (prisma as any).homeworkAcknowledgement.upsert({
    where: { homeworkId_studentId: { homeworkId, studentId } },
    create: { homeworkId, studentId, ...data },
    update: data,
  });
}
