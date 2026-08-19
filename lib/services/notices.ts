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
  const audience    = input.audience || "ALL";
  const isPublished = input.isPublished !== undefined ? Boolean(input.isPublished) : true;
  const notice = await (prisma as any).notice.create({
    data: {
      title:       input.title.trim(),
      content:     input.content.trim(),
      audience,
      attachment:  input.attachment  || null,
      isPublished,
      postedById:  input.postedById,
    },
    include: { postedBy: true },
  });

  // Mirror school-wide notices onto the public website (Notice Board +
  // ticker) so posting once covers both the portal and the public site,
  // instead of staff needing to re-enter it in Website Manager too.
  if (audience === "ALL" && isPublished) {
    await (prisma as any).websiteNotice.create({
      data: {
        title:          notice.title,
        body:           notice.content,
        type:           "info",
        isActive:       true,
        sourceNoticeId: notice.id,
      },
    }).catch(() => {}); // best-effort — the portal notice is the source of truth
  }

  return notice;
}

export async function deleteNotice(id: string) {
  const prisma = await getDb();
  const notice = await (prisma as any).notice.findUnique({ where: { id } });
  if (!notice) throw Object.assign(new Error("Notice not found"), { code: "NOT_FOUND" });
  await (prisma as any).websiteNotice.deleteMany({ where: { sourceNoticeId: id } }).catch(() => {});
  return (prisma as any).notice.delete({ where: { id } });
}
