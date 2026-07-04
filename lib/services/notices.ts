import { getDb } from "@/lib/db";

export async function listNotices(audience?: string) {
  const where = audience ? { audience, isPublished: true } : { isPublished: true };
  const prisma = await getDb();
  return (prisma as any).notice.findMany({
    where,
    include: { postedBy: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNotice(input: {
  title: string;
  content: string;
  audience?: "ALL" | "STAFF" | "STUDENTS" | "PARENTS";
  attachment?: string;
  isPublished?: boolean;
  postedById: string;
}) {
  if (!input.title?.trim()) throw Object.assign(new Error("Title is required"), { code: "VALIDATION" });
  if (!input.content?.trim()) throw Object.assign(new Error("Content is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).notice.create({
    data: {
      title:       input.title.trim(),
      content:     input.content.trim(),
      audience:    input.audience    || "ALL",
      attachment:  input.attachment  || null,
      isPublished: input.isPublished !== undefined ? Boolean(input.isPublished) : true,
      postedById:  input.postedById,
    },
    include: { postedBy: true },
  });
}

export async function deleteNotice(id: string) {
  const prisma = await getDb();
  const notice = await (prisma as any).notice.findUnique({ where: { id } });
  if (!notice) throw Object.assign(new Error("Notice not found"), { code: "NOT_FOUND" });
  return (prisma as any).notice.delete({ where: { id } });
}
