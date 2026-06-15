import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ClipboardList, DollarSign, BookOpen, Calendar, User, GraduationCap } from "lucide-react";
import { StudentProfileActions, StudentAvatar } from "./StudentProfileActions";

async function getStudent(id: string) {
  return ((await getDb()) as any).student.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true } },
      schoolHouse: true,
      sessions: {
        include: {
          session: true,
          classSection: { include: { class: true, section: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      attendances: {
        include: {
          attendanceDay: true,
          attendanceType: true,
        },
        orderBy: { attendanceDay: { date: "desc" } },
        take: 60,
      },
      feesMasters: {
        include: {
          feeSessionGroup: { include: { feeGroup: true } },
          deposits: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      markEntries: {
        include: {
          subject: { select: { name: true, code: true } },
          examSchedule: {
            include: { examGroup: { select: { name: true, isPublished: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

const ATT_STYLE: Record<string, string> = {
  P: "bg-green-100 text-green-700",
  A: "bg-red-100 text-red-700",
  L: "bg-yellow-100 text-yellow-700",
  H: "bg-purple-100 text-purple-700",
  F: "bg-orange-100 text-orange-700",
};

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const currentSession = student.sessions[0];
  const classLabel = currentSession
    ? `${currentSession.classSection.class.name} – ${currentSession.classSection.section.name}`
    : "Not enrolled";

  // Attendance summary (exclude holidays)
  const schoolDays = student.attendances.filter(
    (a: any) => a.attendanceType?.keyValue !== "H"
  );
  const present = student.attendances.filter(
    (a: any) => a.attendanceType?.keyValue === "P" || a.attendanceType?.keyValue === "L"
  ).length;
  const absent = student.attendances.filter(
    (a: any) => a.attendanceType?.keyValue === "A"
  ).length;
  const pct = schoolDays.length > 0 ? Math.round((present / schoolDays.length) * 100) : 0;

  // Fee summary
  const totalInvoiced = student.feesMasters.reduce(
    (sum: number, fm: any) => sum + Number(fm.amount), 0
  );
  const totalPaid = student.feesMasters.reduce((sum: number, fm: any) => {
    return sum + fm.deposits.reduce((s: number, d: any) => {
      const detail = d.amountDetail as Record<string, any>;
      return s + Object.values(detail).reduce((ds: number, v: any) => ds + Number(v?.amount ?? 0), 0);
    }, 0);
  }, 0);

  // Published exam results
  const publishedMarks = student.markEntries.filter(
    (m: any) => m.examSchedule?.examGroup?.isPublished
  );

  const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Student Profile" />
      <main className="flex-1 p-6 space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
          </Link>
          <Link
            href={`/students/${student.id}/id-card`}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <GraduationCap className="h-3.5 w-3.5" /> Print ID Card
          </Link>
        </div>

        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <StudentAvatar
                studentId={student.id}
                image={student.image}
                initials={`${student.firstName[0]}${(student.lastName ?? "?")[0]}`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {student.firstName} {student.middleName ? student.middleName + " " : ""}{student.lastName}
                    </h1>
                    <p className="text-sm text-gray-500 font-mono">{student.admissionNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${student.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {student.isActive ? "Active" : "Inactive"}
                    </span>
                    <StudentProfileActions student={student} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Class</p>
                    <p className="text-gray-700">{classLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Roll No</p>
                    <p className="text-gray-700">{currentSession?.rollNo ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Birth</p>
                    <p className="text-gray-700">{dob}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Gender</p>
                    <p className="text-gray-700">{student.gender ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Blood Group</p>
                    <p className="text-gray-700">{student.bloodGroup ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Mobile</p>
                    <p className="text-gray-700">{student.mobileNo ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">School House</p>
                    <p className="text-gray-700">{student.schoolHouse?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Session</p>
                    <p className="text-gray-700">{currentSession?.session.session ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guardian Info */}
        {(student.fatherName || student.motherName || student.guardianName) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" /> Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                {student.fatherName && <>
                  <div>
                    <p className="text-xs text-gray-400">Father&apos;s Name</p>
                    <p>{student.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Father&apos;s Phone</p>
                    <p>{student.fatherPhone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Father&apos;s Occupation</p>
                    <p>{student.fatherOccupation ?? "—"}</p>
                  </div>
                </>}
                {student.motherName && <>
                  <div>
                    <p className="text-xs text-gray-400">Mother&apos;s Name</p>
                    <p>{student.motherName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Mother&apos;s Phone</p>
                    <p>{student.motherPhone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Mother&apos;s Occupation</p>
                    <p>{student.motherOccupation ?? "—"}</p>
                  </div>
                </>}
                {student.guardianName && <>
                  <div>
                    <p className="text-xs text-gray-400">Guardian Name</p>
                    <p>{student.guardianName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Guardian Phone</p>
                    <p>{student.guardianPhone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Guardian Email</p>
                    <p>{student.guardianEmail ?? "—"}</p>
                  </div>
                </>}
              </div>
            </CardContent>
          </Card>
        )}

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
                <p className={`text-4xl font-bold ${pct < 75 ? "text-red-600" : "text-green-600"}`}>{pct}%</p>
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
                <p className="text-xs text-red-600 bg-red-50 rounded p-2">Below 75% threshold</p>
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
              {student.feesMasters.slice(0, 3).map((fm: any) => (
                <div key={fm.id} className="text-[13px] font-semibold text-slate-700 truncate">
                  {fm.feeSessionGroup?.feeGroup?.name}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Attendance calendar dots */}
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
                  {student.attendances.slice(0, 30).map((a: any) => {
                    const kv = a.attendanceType?.keyValue ?? "?";
                    return (
                      <div
                        key={a.id}
                        title={`${new Date(a.attendanceDay.date).toLocaleDateString()} — ${a.attendanceType?.type ?? kv}`}
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold cursor-default ${ATT_STYLE[kv] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {kv}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exam Results */}
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
                      <td className="px-3 py-2 text-gray-500 text-xs">{m.examSchedule?.examGroup?.name}</td>
                      <td className="px-3 py-2 font-medium">{m.subject?.name}</td>
                      <td className="px-3 py-2">
                        {Number(m.marksObtained)} / {m.examSchedule?.fullMarks}
                        {m.examSchedule?.fullMarks > 0 && (
                          <span className="text-gray-400 text-xs ml-1">
                            ({Math.round((Number(m.marksObtained) / m.examSchedule.fullMarks) * 100)}%)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-bold text-blue-700">{m.grade ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.isPassing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {m.isPassing ? "PASS" : "FAIL"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Enrollment history */}
        {student.sessions.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal-600" /> Enrollment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Session</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Class / Section</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Roll No</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {student.sessions.map((ss: any) => (
                    <tr key={ss.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{ss.session.session}</td>
                      <td className="px-3 py-2">{ss.classSection.class.name} – {ss.classSection.section.name}</td>
                      <td className="px-3 py-2 text-gray-500">{ss.rollNo ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ss.isAlumni ? "bg-gray-100 text-gray-600" : ss.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {ss.isAlumni ? "Alumni" : ss.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {student.disableReason && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-red-700">Disable Reason</p>
              <p className="text-sm text-red-600 mt-1">{student.disableReason}</p>
              {student.disableNote && <p className="text-xs text-red-500 mt-1">{student.disableNote}</p>}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
