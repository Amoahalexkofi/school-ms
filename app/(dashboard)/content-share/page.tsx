import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ContentShareClient } from "./ContentShareClient";

export default async function ContentSharePage() {
  const contents = await ((await getDb()) as any).shareContent.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Content Share" />
      <ContentShareClient contents={contents} />
    </div>
  );
}
