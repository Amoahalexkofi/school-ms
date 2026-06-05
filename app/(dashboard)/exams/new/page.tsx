import { Topbar } from "@/components/Topbar";
import { NewExamGroupForm } from "./NewExamGroupForm";

export default async function NewExamGroupPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="New Exam Group" />
      <NewExamGroupForm />
    </div>
  );
}
