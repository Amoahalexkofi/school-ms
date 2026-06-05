import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { NoticeBoardClient } from "./NoticeBoardClient";

async function getData() {
  const notices = await ((await getDb()) as any).notice.findMany({
    where: { isPublished: true },
    include: { postedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return { notices };
}

export default async function NoticeBoardPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notice Board" />
      <NoticeBoardClient {...data} />
    </div>
  );
}
