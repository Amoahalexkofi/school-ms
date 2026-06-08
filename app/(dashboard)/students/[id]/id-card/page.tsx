import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { IdCardClient } from "./IdCardClient";

export default async function IdCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const [student, school, template] = await Promise.all([
    (db as any).student.findUnique({
      where: { id },
      include: {
        schoolHouse: true,
        sessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    (db as any).schoolProfile.findFirst(),
    // Smart School: use the active (status=1) template
    (db as any).idCard.findFirst({ where: { status: 1, isActive: true } }),
  ]);

  if (!student) notFound();

  return <IdCardClient student={student} school={school} template={template} />;
}
