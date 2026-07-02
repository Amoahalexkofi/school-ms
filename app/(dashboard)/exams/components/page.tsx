import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ComponentsClient } from "./ComponentsClient";

export default async function AssessmentComponentsPage() {
  const components = await ((await getDb()) as any).assessmentComponent
    .findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })
    .catch(() => []);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Continuous Assessment Setup" />
      <ComponentsClient
        initial={components.map((c: any) => ({
          id: c.id, name: c.name, weight: Number(c.weight), isExam: c.isExam,
        }))}
      />
    </div>
  );
}
