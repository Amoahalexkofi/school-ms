import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { NewExamForm } from "./NewExamForm";
import { requireStaffPage } from "@/lib/auth/guards";

async function getData() {
  const [classes, subjects] = await Promise.all([
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).subject.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { classes, subjects };
}

export default async function NewExamPage() {
  await requireStaffPage("/online-exams");
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Create Exam" />
      <NewExamForm {...data} />
    </div>
  );
}
