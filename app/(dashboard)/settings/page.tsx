import { prisma } from "@/lib/prisma";
import { getSchoolProfile } from "@/lib/services/school-profile";
import { SettingsClient } from "./SettingsClient";

async function getSettingsData() {
  const [sessions, classes, subjects, profile, staff] = await Promise.all([
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).class.findMany({
      include: { session: true, sections: true, _count: { select: { subjects: true } } },
      orderBy: { name: "asc" },
    }),
    (prisma as any).subject.findMany({
      include: { class: { include: { session: true } } },
      orderBy: { name: "asc" },
    }),
    getSchoolProfile(),
    (prisma as any).staff.findMany({ orderBy: { firstName: "asc" } }),
  ]);
  return { sessions, classes, subjects, profile, staff };
}

export default async function SettingsPage() {
  const data = await getSettingsData();
  return <SettingsClient {...data} />;
}
