import { prisma } from "@/lib/prisma";
import { getSchoolProfile } from "@/lib/services/school-profile";
import { SettingsClient } from "./SettingsClient";

async function getSettingsData() {
  const [sessions, classes, sections, subjects, profile, staff] = await Promise.all([
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).class.findMany({
      include: {
        classSections: { include: { section: { select: { id: true, name: true } } } },
        _count: { select: { subjects: true } },
      },
      orderBy: { name: "asc" },
    }),
    (prisma as any).section.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).subject.findMany({
      include: { class: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
    getSchoolProfile(),
    (prisma as any).staff.findMany({
      include: { designation: { select: { name: true } } },
      orderBy: { firstName: "asc" },
    }),
  ]);
  return { sessions, classes, sections, subjects, profile, staff };
}

export default async function SettingsPage() {
  const data = await getSettingsData();
  return <SettingsClient {...data} />;
}
