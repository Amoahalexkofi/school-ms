import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CheckSquare, BookOpen } from "lucide-react";

function NoProfile() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Homework" />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-500">No student profile linked</p>
          <p className="text-sm text-slate-400 mt-1">This demo account is not connected to a student record.</p>
        </div>
      </main>
    </div>
  );
}

export default async function MyHomeworkPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;

  let student: any = null;
  let homework: any[] = [];

  try {
    const db = await getDb();
    student = await (db as any).student.findUnique({
      where: { userId },
      include: {
        sessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }).catch(() => null);

    if (!student) return <NoProfile />;

    const cs = student.sessions[0]?.classSection;
    const sessionId = student.sessions[0]?.sessionId;
    if (cs && sessionId) {
      homework = await (db as any).homework.findMany({
        where: { classSectionId: cs.id, sessionId },
        include: {
          subject: true,
          staff: { select: { firstName: true, lastName: true } },
          acknowledgements: { where: { studentId: student.id } },
        },
        orderBy: { homeworkDate: "desc" },
      }).catch(() => []);
    }
  } catch {
    return <NoProfile />;
  }

  if (!student) return <NoProfile />;

  const cs = student.sessions[0]?.classSection;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const pending   = homework.filter((h: any) => h.acknowledgements.length === 0 && new Date(h.dueDate) >= today);
  const submitted = homework.filter((h: any) => h.acknowledgements.length > 0);
  const overdue   = homework.filter((h: any) => h.acknowledgements.length === 0 && new Date(h.dueDate) < today);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Homework" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckSquare className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-[17px] text-slate-900">My Homework</p>
              <p className="text-slate-500 text-sm mt-0.5">{cs?.class?.name} {cs?.section?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ l: "Pending", v: pending.length, col: "text-slate-900" }, { l: "Submitted", v: submitted.length, col: "text-emerald-600" }, { l: "Overdue", v: overdue.length, col: overdue.length > 0 ? "text-rose-600" : "text-slate-900" }].map(s => (
              <div key={s.l} className="bg-slate-50 rounded-lg p-3 text-center">
                <p className={`text-2xl font-semibold tabular-nums ${s.col}`}>{s.v}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {overdue.length > 0 && <HomeworkList title="Overdue" items={overdue} variant="overdue" />}
        {pending.length > 0 && <HomeworkList title="Pending" items={pending} variant="pending" />}
        {submitted.length > 0 && <HomeworkList title="Submitted" items={submitted} variant="submitted" />}

        {homework.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No homework assigned yet</p>
          </div>
        )}
      </main>
    </div>
  );
}

function HomeworkList({ title, items, variant }: {
  title: string; items: any[]; variant: "pending" | "submitted" | "overdue";
}) {
  const colors = {
    pending:   { dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700" },
    submitted: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
    overdue:   { dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700" },
  };
  const c = colors[variant];
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200 bg-slate-50">
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <p className="font-semibold text-sm text-slate-800">{title}</p>
        <span className="ml-auto text-xs text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((h: any) => (
          <div key={h.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest">{h.subject?.name}</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{h.title ?? h.description?.slice(0, 80)}</p>
                {h.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{h.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  {h.homeworkDate && <span>Assigned: {new Date(h.homeworkDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                  <span className={variant === "overdue" ? "text-rose-500 font-semibold" : ""}>
                    Due: {new Date(h.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  {h.staff && <span>· By {h.staff.firstName} {h.staff.lastName}</span>}
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${c.badge}`}>
                {variant === "submitted" ? "✓ Submitted" : variant === "overdue" ? "Overdue" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
