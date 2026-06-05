import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { NewQuestionForm } from "./NewQuestionForm";

async function getData() {
  const [classes, subjects] = await Promise.all([
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).subject.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { classes, subjects };
}

export default async function NewQuestionPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Question" />
      <NewQuestionForm {...data} />
    </div>
  );
}
