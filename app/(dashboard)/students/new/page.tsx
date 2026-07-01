import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddStudentForm } from "./AddStudentForm";
import { getApplication } from "@/lib/services/admissions";

async function getData() {
  const [sessions, classSections, schoolHouses] = await Promise.all([
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    ((await getDb()) as any).schoolHouse.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { sessions, classSections, schoolHouses };
}

// Map an approved online application onto the student-form fields.
function prefillFromApplication(app: any) {
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
  const initial: Record<string, any> = {
    firstName:      app.firstName ?? "",
    lastName:       app.lastName ?? "",
    dateOfBirth:    app.dateOfBirth ? new Date(app.dateOfBirth).toISOString().slice(0, 10) : "",
    gender:         cap(String(app.gender ?? "")),
    guardianIs:     "Father",
    fatherName:     app.parentName ?? "",
    fatherPhone:    app.parentPhone ?? "",
    fatherEmail:    app.parentEmail ?? "",
    currentAddress: app.address ?? "",
    note:           app.notes ?? "",
  };
  return {
    initial,
    fromApplication: {
      name: `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim(),
      appliedClass: app.classAppliedFor ?? "",
    },
  };
}

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await getData();
  const sp = await searchParams;
  const applicationId = typeof sp?.applicationId === "string" ? sp.applicationId : undefined;

  // Pre-fill from an approved application when enrolling. Skip if it's already
  // been enrolled (guarded again on the server at create time).
  let prefill: { initial: Record<string, any>; fromApplication: { name: string; appliedClass: string } } | null = null;
  if (applicationId) {
    const app = await getApplication(applicationId).catch(() => null);
    if (app && !app.enrolledStudentId) prefill = prefillFromApplication(app);
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Student" />
      <AddStudentForm
        {...data}
        applicationId={prefill ? applicationId : undefined}
        initial={prefill?.initial}
        fromApplication={prefill?.fromApplication}
      />
    </div>
  );
}
