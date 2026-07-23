import { getDb } from "@/lib/db";
import { getSchoolProfile } from "@/lib/services/school-profile";
import { SettingsClient } from "./SettingsClient";

async function getSettingsData() {
  const [sessions, classes, sections, subjects, profile, staff] = await Promise.all([
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).class.findMany({
      where: { isActive: true },
      include: {
        classSections: {
          where: { section: { isActive: true } },
          select: {
            id: true,
            sectionId: true,
            section: { select: { id: true, name: true } },
            teacher: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { section: { name: "asc" } },
        },
        _count: { select: { subjects: true } },
      },
      orderBy: { name: "asc" },
    }),
    ((await getDb()) as any).section.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).subject.findMany({
      where: { isActive: true },
      include: { class: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
    getSchoolProfile(),
    ((await getDb()) as any).staff.findMany({
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
