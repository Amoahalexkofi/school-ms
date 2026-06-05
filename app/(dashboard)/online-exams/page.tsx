import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { OnlineExamsClient } from "./OnlineExamsClient";

async function getData() {
  const [exams, classes, subjects] = await Promise.all([
    ((await getDb()) as any).onlineExam.findMany({
      include: {
        class: { select: { id: true, name: true } },
        _count: { select: { questions: true, attempts: true } },
        attempts: {
          where: { submittedAt: { not: null } },
          select: { score: true, total: true },
        },
      },
      orderBy: { startTime: "desc" },
    }),
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).subject.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { exams, classes, subjects };
}

export default async function OnlineExamsPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Online Exams" />
      <OnlineExamsClient {...data} />
    </div>
  );
}
