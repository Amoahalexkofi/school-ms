import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CheckSquare, Clock, CheckCircle2, BookOpen } from "lucide-react";

export default async function MyHomeworkPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;
  const db = await getDb();

  const student = await (db as any).student.findUnique({
    where: { userId },
    include: {
      studentSessions: {
        include: { session: true, classSection: { include: { class: true, section: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!student) redirect("/dashboard");

  const cs = student.studentSessions[0]?.classSection;
  if (!cs) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="My Homework" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-white/30">No active enrollment found.</p>
        </main>
      </div>
    );
  }

  // Get homework for this student's class + section (following Smart School pattern)
  const homework = await (db as any).homework.findMany({
    where: {
      classSectionId: cs.id,
      sessionId: student.studentSessions[0].sessionId,
    },
    include: {
      subject: true,
      staff: { select: { firstName: true, lastName: true } },
      submissions: { where: { studentId: student.id } },
    },
    orderBy: { homeworkDate: "desc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pending   = homework.filter((h: any) => h.submissions.length === 0 && new Date(h.submissionDate) >= today);
  const submitted = homework.filter((h: any) => h.submissions.length > 0);
  const overdue   = homework.filter((h: any) => h.submissions.length === 0 && new Date(h.submissionDate) < today);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Homework" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#111318]/20 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-xl">My Homework</p>
              <p className="text-amber-200 text-sm">
                {cs.class?.name} {cs.section?.name}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ l: "Pending", v: pending.length, col: "text-white" }, { l: "Submitted", v: submitted.length, col: "text-emerald-300" }, { l: "Overdue", v: overdue.length, col: overdue.length > 0 ? "text-rose-300" : "text-white" }].map(s => (
              <div key={s.l} className="bg-[#111318]/15 rounded-xl p-3 text-center">
                <p className={`text-2xl font-black ${s.col}`}>{s.v}</p>
                <p className="text-xs text-white/70 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <HomeworkList title="Overdue" items={overdue} variant="overdue" studentId={student.id} />
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <HomeworkList title="Pending" items={pending} variant="pending" studentId={student.id} />
        )}

        {/* Submitted */}
        {submitted.length > 0 && (
          <HomeworkList title="Submitted" items={submitted} variant="submitted" studentId={student.id} />
        )}

        {homework.length === 0 && (
          <div className="text-center py-16 bg-[#111318] rounded-2xl border border-white/[0.04]">
            <BookOpen className="h-10 w-10 mx-auto text-white/30 mb-3" />
            <p className="text-white/40 font-medium">No homework assigned yet</p>
          </div>
        )}
      </main>
    </div>
  );
}

function HomeworkList({ title, items, variant, studentId }: {
  title: string; items: any[]; variant: "pending" | "submitted" | "overdue"; studentId: string;
}) {
  const colors = {
    pending:   { dot: "bg-amber-500",  badge: "bg-amber-500/10 text-amber-400",  heading: "text-amber-400" },
    submitted: { dot: "bg-emerald-500",badge: "bg-emerald-500/10 text-emerald-400", heading: "text-emerald-400" },
    overdue:   { dot: "bg-rose-500",   badge: "bg-rose-500/10 text-rose-400",    heading: "text-rose-400" },
  };
  const c = colors[variant];

  return (
    <div className="bg-[#111318] rounded-2xl border border-white/[0.04] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b bg-[#0f1015]">
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <p className={`font-bold text-sm ${c.heading}`}>{title}</p>
        <span className="ml-auto text-xs text-white/30">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="divide-y">
        {items.map((h: any) => {
          const sub = h.submissions[0];
          return (
            <div key={h.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      {h.subject?.name}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white/80">{h.homeworkTitle ?? h.description?.slice(0, 80)}</p>
                  {h.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{h.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span>Assigned: {new Date(h.homeworkDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    <span>·</span>
                    <span className={variant === "overdue" ? "text-rose-500 font-bold" : ""}>
                      Due: {new Date(h.submissionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                    {h.staff && <span>· By {h.staff.firstName} {h.staff.lastName}</span>}
                  </div>
                  {sub?.remarks && (
                    <div className="mt-2 bg-emerald-500/10 border border-emerald-500/15 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-emerald-400"><span className="font-bold">Teacher feedback:</span> {sub.remarks}</p>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${c.badge}`}>
                  {variant === "submitted" ? "✓ Submitted" : variant === "overdue" ? "Overdue" : "Pending"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
