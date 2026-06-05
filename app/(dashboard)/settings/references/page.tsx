import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { SourcesClient } from "../sources/SourcesClient";

export default async function ReferencesPage() {
  const items = await ((await getDb()) as any).reference.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="References" />
      <SourcesClient items={items} entity="reference" apiPath="/api/references" title="References" description="Reference names used when logging enquiries (e.g. Friends, Newspaper, Alumni)." />
    </div>
  );
}
