import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { SourcesClient } from "./SourcesClient";

export default async function SourcesPage() {
  const sources = await ((await getDb()) as any).source.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Enquiry Sources" />
      <SourcesClient items={sources} entity="source" apiPath="/api/sources" title="Enquiry Sources" description="Sources used when logging admissions enquiries (e.g. Walk-in, Referral, Social Media)." />
    </div>
  );
}
