import { getDb } from "@/lib/db";
import { getSchoolProfile } from "@/lib/services/school-profile";
import { SettingsClient } from "./SettingsClient";

async function getSettingsData() {
  const [sessions, classes, sections, subjects, profile, staff] = await Promise.all([
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).class.findMany({
      include: {
        classSections: { include: { section: { select: { id: true, name: true } } } },
        _count: { select: { subjects: true } },
      },
      orderBy: { name: "asc" },
    }),
    ((await getDb()) as any).section.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).subject.findMany({
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
