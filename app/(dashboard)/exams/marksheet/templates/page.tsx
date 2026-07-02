import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { MarksheetTemplatesClient } from "./MarksheetTemplatesClient";

export default async function MarksheetTemplatesPage() {
  await requireStaffPage("/exams");
  const db = (await getDb()) as any;
  const [templates, profile] = await Promise.all([
    db.templateMarksheet.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []),
    db.schoolProfile.findFirst({ select: { name: true, address: true, logo: true, motto: true } }).catch(() => null),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Marksheet Templates" />
      <MarksheetTemplatesClient
        templates={templates}
        school={{
          name: profile?.name ?? "Your School",
          address: profile?.address ?? null,
          logo: profile?.logo ?? null,
          motto: profile?.motto ?? null,
        }}
      />
    </div>
  );
}
