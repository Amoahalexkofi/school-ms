import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { StaffIdCardClient } from "./StaffIdCardClient";

export default async function StaffIdCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const [staff, template] = await Promise.all([
    (db as any).staff.findUnique({
      where: { id },
      include: {
        department:  { select: { name: true } },
        designation: { select: { name: true } },
        user:        { select: { role: true } },
      },
    }),
    // Smart School: use the most-recently-created template (no active status flag on StaffIdCard)
    (db as any).staffIdCard.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!staff) notFound();

  return <StaffIdCardClient staff={staff} template={template} />;
}
