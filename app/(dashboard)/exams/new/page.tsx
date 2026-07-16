import { Topbar } from "@/components/Topbar";
import { getDb } from "@/lib/db";
import { getCurrentTerm } from "@/lib/services/term";
import { NewExamGroupForm } from "./NewExamGroupForm";

export default async function NewExamGroupPage() {
  // Pre-fill the name from the school's current term — this string lands on
  // the printed GES terminal report, so consistency beats free-typing.
  const session = await ((await getDb()) as any).academicSession
    .findFirst({ orderBy: [{ isActive: "desc" }, { startDate: "desc" }], select: { id: true } })
    .catch(() => null);
  const term = await getCurrentTerm(session?.id ?? null).catch(() => null);
  const suggestedName = term ? `End of ${term.name} Examination` : "";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="New Exam Group" />
      <NewExamGroupForm suggestedName={suggestedName} />
    </div>
  );
}
