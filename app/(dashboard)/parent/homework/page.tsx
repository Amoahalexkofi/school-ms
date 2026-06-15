import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CheckSquare, Users, BookOpen } from "lucide-react";

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
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center"><Users className="h-10 w-10 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No children linked.</p></div>
        </main>
      </div>
    );
  }

  const today = new Date(); today.setHours(0,0,0,0);

  const children = await Promise.all(childIds.map(async (id: string) => {
    const student = await (db as any).student.findUnique({
      where: { id },
      include: {
        studentSessions: {
          include: { classSection: { include: { class: true, section: true } }, session: true },
          orderBy: { createdAt: "desc" }, take: 1,
        },
      },
    });
    if (!student) return null;
    const cs = student.studentSessions[0];
    const homework = await (db as any).homework.findMany({
      where: { classSectionId: cs?.classSection?.id, sessionId: cs?.sessionId },
      include: {
        subject: true,
        staff: { select: { firstName: true, lastName: true } },
        submissions: { where: { studentId: id } },
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
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">{student.firstName[0]}{student.lastName?.[0]}</div>
                  <div>
                    <p className="font-black text-lg">{student.firstName} {student.lastName}</p>
                    <p className="text-amber-200 text-sm">{cs?.classSection?.class?.name} {cs?.classSection?.section?.name}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-black">{homework.filter((h: any) => h.submissions.length === 0 && new Date(h.submissionDate) >= today).length}</p>
                    <p className="text-amber-200 text-xs">pending</p>
                  </div>
                </div>
              </div>
              {homework.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                  <BookOpen className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No homework found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y">
                  {homework.map((h: any) => {
                    const submitted = h.submissions.length > 0;
                    const overdue   = !submitted && new Date(h.submissionDate) < today;
                    const variant   = submitted ? "submitted" : overdue ? "overdue" : "pending";
                    const s = variantStyle[variant];
                    return (
                      <div key={h.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{h.subject?.name}</span>
                            <p className="text-sm font-bold text-gray-900 mt-0.5">{h.homeworkTitle ?? h.description?.slice(0, 60)}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Due: {new Date(h.submissionDate).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
                              {h.staff && ` · ${h.staff.firstName} ${h.staff.lastName}`}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
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
