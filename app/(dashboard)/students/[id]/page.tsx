import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, GraduationCap, ClipboardList,
  DollarSign, BookOpen, Calendar,
} from "lucide-react";

async function getStudent(id: string) {
  return (prisma as any).student.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true } },
      parent: { select: { firstName: true, lastName: true, phone: true, email: true } },
      enrollments: {
        include: { section: { include: { class: true, classTeacher: true } } },
        orderBy: { enrolledAt: "desc" },
      },
      feeInvoices: {
        include: { feeGroup: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      attendances: {
        include: { attendanceDay: true },
        orderBy: { attendanceDay: { date: "desc" } },
        take: 60,
      },
      markEntries: {
        include: {
          subject: { select: { name: true, code: true } },
          examSchedule: {
            include: { examGroup: { select: { name: true, published: true } } },
          },
        },
        orderBy: { examSchedule: { date: "desc" } },
      },
    },
  });
}

const STATUS_STYLE: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-700",
  HALF_DAY: "bg-orange-100 text-orange-700",
};

const FEE_STYLE: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
};

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const enrollment = student.enrollments[0];
  const className = enrollment
    ? `${enrollment.section.class.name} – Section ${enrollment.section.name}`
    : "Not enrolled";

  // Attendance summary
  const schoolDays = student.attendances.filter(
    (a: any) => a.status !== "HOLIDAY"
  );
  const present = student.attendances.filter(
    (a: any) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const absent = student.attendances.filter(
    (a: any) => a.status === "ABSENT"
  ).length;
  const pct =
    schoolDays.length > 0
      ? Math.round((present / schoolDays.length) * 100)
      : 0;

  // Fee summary
  const totalInvoiced = student.feeInvoices.reduce(
    (s: number, i: any) => s + Number(i.totalAmount), 0
  );
  const totalPaid = student.feeInvoices.reduce(
    (s: number, i: any) => s + Number(i.paidAmount), 0
  );

  // Published results only
  const publishedMarks = student.markEntries.filter(
    (m: any) => m.examSchedule?.examGroup?.published
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Student Profile" />
      <main className="flex-1 p-6 space-y-6 max-w-5xl">
        {/* Back */}
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
        </Link>

        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Full Name</p>
                  <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Admission No.</p>
                  <p className="font-mono text-sm text-gray-700">{student.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Class</p>
                  <p className="text-gray-700">{className}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Birth</p>
                  <p className="text-gray-700">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Gender</p>
                  <p className="text-gray-700">{student.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-gray-700 text-sm">{student.user?.email ?? "—"}</p>
                </div>
                {student.parent && (
                  <div className="col-span-full">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Parent / Guardian</p>
                    <p className="text-gray-700">
                      {student.parent.firstName} {student.parent.lastName}
                      {student.parent.phone && ` · ${student.parent.phone}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-600" /> Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center py-2">
                <p className={`text-4xl font-bold ${pct < 75 ? "text-red-600" : "text-green-600"}`}>
                  {pct}%
                </p>
                <p className="text-xs text-gray-400 mt-1">of {schoolDays.length} school days</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="bg-green-50 rounded-lg py-2">
                  <p className="font-bold text-green-700">{present}</p>
                  <p className="text-xs text-green-600">Present</p>
                </div>
                <div className="bg-red-50 rounded-lg py-2">
                  <p className="font-bold text-red-700">{absent}</p>
                  <p className="text-xs text-red-600">Absent</p>
                </div>
              </div>
              {pct < 75 && schoolDays.length > 0 && (
                <p className="text-xs text-red-600 bg-red-50 rounded p-2">
                  ⚠ Below 75% threshold
                </p>
              )}
            </CardContent>
          </Card>

          {/* Fee summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-600" /> Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Invoiced</span>
                  <span className="font-medium">₵{totalInvoiced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>
                  <span className="font-medium text-green-600">₵{totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-500">Balance</span>
                  <span className={`font-bold ${totalInvoiced - totalPaid > 0 ? "text-red-600" : "text-green-600"}`}>
                    ₵{(totalInvoiced - totalPaid).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                {student.feeInvoices.slice(0, 3).map((inv: any) => (
                  <div key={inv.id} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 truncate">{inv.feeGroup?.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${FEE_STYLE[inv.status]}`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent attendance log */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" /> Recent Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.attendances.length === 0 ? (
                <p className="text-xs text-gray-400">No attendance records yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {student.attendances.slice(0, 30).map((a: any) => (
                    <div
                      key={a.id}
                      title={`${new Date(a.attendanceDay.date).toLocaleDateString()} — ${a.status}`}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold cursor-default ${STATUS_STYLE[a.status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {a.status[0]}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Published exam results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" /> Exam Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {publishedMarks.length === 0 ? (
              <p className="text-sm text-gray-400">No published results yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Exam</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Subject</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Marks</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Grade</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {publishedMarks.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {m.examSchedule?.examGroup?.name}
                      </td>
                      <td className="px-3 py-2 font-medium">{m.subject?.name}</td>
                      <td className="px-3 py-2">
                        {Number(m.totalMarks)} / {m.examSchedule?.maxMarks}
                        <span className="text-gray-400 text-xs ml-1">
                          ({Math.round((Number(m.totalMarks) / m.examSchedule?.maxMarks) * 100)}%)
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-blue-700">{m.grade ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {m.isPassed ? "PASS" : "FAIL"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
