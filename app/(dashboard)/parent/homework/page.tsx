import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { Users, BookOpen } from "lucide-react";

export default async function ParentHomeworkPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const user = session.user as any;
  const db = await getDb();

  const parentUser = await (db as any).user.findUnique({ where: { id: user.id } });
  const childIds = (parentUser?.childs ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);

  if (childIds.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="Homework" />
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center"><Users className="h-10 w-10 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">No children linked.</p></div>
        </main>
      </div>
    );
  }

  const today = new Date(); today.setHours(0,0,0,0);

  const children = await Promise.all(childIds.map(async (id: string) => {
    const student = await (db as any).student.findUnique({
      where: { id },
      include: {
        sessions: {
          include: { classSection: { include: { class: true, section: true } }, session: true },
          orderBy: { createdAt: "desc" }, take: 1,
        },
      },
    });
    if (!student) return null;
    const cs = student.sessions[0];
    const homework = await (db as any).homework.findMany({
      where: { classSectionId: cs?.classSection?.id, sessionId: cs?.sessionId },
      include: {
        subject: true,
        staff: { select: { firstName: true, lastName: true } },
        acknowledgements: { where: { studentId: id } },
      },
      orderBy: { homeworkDate: "desc" },
      take: 20,
    });
    return { student, cs, homework };
  }));

  const variantStyle = {
    submitted: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    pending:   { badge: "bg-amber-50 text-amber-700",   dot: "bg-amber-500"   },
    overdue:   { badge: "bg-rose-50 text-rose-700",     dot: "bg-rose-500"    },
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Homework" />
      <main className="flex-1 p-4 md:p-6 space-y-8 max-w-4xl mx-auto w-full">
        {children.map((data, idx) => {
          if (!data) return null;
          const { student, cs, homework } = data;
          return (
            <div key={childIds[idx]}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-semibold text-sm text-slate-600 shrink-0">{student.firstName[0]}{student.lastName?.[0]}</div>
                  <div>
                    <p className="font-semibold text-[17px] text-slate-900">{student.firstName} {student.lastName}</p>
                    <p className="text-slate-500 text-sm mt-0.5">{cs?.classSection?.class?.name} {cs?.classSection?.section?.name}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-semibold text-slate-900 tabular-nums">{homework.filter((h: any) => h.acknowledgements.length === 0 && new Date(h.dueDate) >= today).length}</p>
                    <p className="text-slate-400 text-xs">pending</p>
                  </div>
                </div>
              </div>
              {homework.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
                  <BookOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No homework found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {homework.map((h: any) => {
                    const submitted = h.acknowledgements.length > 0;
                    const overdue   = !submitted && new Date(h.dueDate) < today;
                    const variant   = submitted ? "submitted" : overdue ? "overdue" : "pending";
                    const s = variantStyle[variant];
                    return (
                      <div key={h.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest">{h.subject?.name}</span>
                            <p className="text-sm font-semibold text-slate-900 mt-0.5">{h.title ?? h.description?.slice(0, 60)}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Due: {new Date(h.dueDate).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
                              {h.staff && ` · ${h.staff.firstName} ${h.staff.lastName}`}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
                            {submitted ? "✓ Submitted" : overdue ? "Overdue" : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
