import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { MarksheetTemplatesClient } from "./MarksheetTemplatesClient";

export default async function MarksheetTemplatesPage() {
  await requireStaffPage("/exams");
  const templates = await ((await getDb()) as any).templateMarksheet
    .findMany({ orderBy: { createdAt: "desc" } })
    .catch(() => []);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Marksheet Templates" />
      <MarksheetTemplatesClient templates={templates} />
    </div>
  );
}
