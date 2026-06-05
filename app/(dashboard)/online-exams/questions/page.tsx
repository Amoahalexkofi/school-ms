import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { QuestionsClient } from "./QuestionsClient";

async function getData() {
  const [questions, classes, subjects] = await Promise.all([
    ((await getDb()) as any).question.findMany({
      where: { isActive: true },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).subject.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { questions, classes, subjects };
}

export default async function QuestionsPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Question Bank" />
      <QuestionsClient {...data} />
    </div>
  );
}
