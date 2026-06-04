import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, DollarSign, Users, ClipboardList } from "lucide-react";

async function getReportData() {
  const [students, staff, invoices, attendanceDays] = await Promise.all([
    (prisma as any).student.findMany({
      include: {
        attendances: { include: { attendanceDay: true } },
        feeInvoices: true,
        enrollments: { include: { section: { include: { class: true } } }, take: 1 },
      },
      orderBy: { firstName: "asc" },
    }),
    (prisma as any).staff.count(),
    (prisma as any).feeInvoice.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
        feeGroup: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).attendanceDay.count({ where: { sessionId: "session-2026" } }),
  ]);
  return { students, staff, invoices, attendanceDays };
}

export default async function ReportsPage() {
  const { students, staff, invoices, attendanceDays } = await getReportData();

  const totalInvoiced = invoices.reduce((s: number, i: any) => s + Number(i.totalAmount), 0);
  const totalPaid = invoices.reduce((s: number, i: any) => s + Number(i.paidAmount), 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Reports" />
      <main className="flex-1 p-6 space-y-8">

        {/* Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Students</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Staff</p>
              <p className="text-3xl font-bold">{staff}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Fee Collection Rate</p>
              <p className={`text-3xl font-bold ${collectionRate < 70 ? "text-red-600" : "text-green-600"}`}>
                {collectionRate}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">School Days Recorded</p>
              <p className="text-3xl font-bold">{attendanceDays}</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" /> Student Attendance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Student</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Admission</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Class</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Present</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Absent</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Late</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Total Days</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((s: any) => {
                    const schoolDays = s.attendances.filter((a: any) => a.status !== "HOLIDAY");
                    const present = s.attendances.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length;
                    const absent = s.attendances.filter((a: any) => a.status === "ABSENT").length;
                    const late = s.attendances.filter((a: any) => a.status === "LATE").length;
                    const pct = schoolDays.length > 0 ? Math.round((present / schoolDays.length) * 100) : 0;
                    const enroll = s.enrollments[0];
                    const cls = enroll ? `${enroll.section.class.name}–${enroll.section.name}` : "—";

                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{s.admissionNumber}</td>
                        <td className="px-3 py-2.5 text-gray-600">{cls}</td>
                        <td className="px-3 py-2.5 text-green-600 font-medium">{present}</td>
                        <td className="px-3 py-2.5 text-red-600 font-medium">{absent}</td>
                        <td className="px-3 py-2.5 text-yellow-600 font-medium">{late}</td>
                        <td className="px-3 py-2.5">{schoolDays.length}</td>
                        <td className="px-3 py-2.5">
                          <span className={`font-semibold ${pct < 75 ? "text-red-600" : pct >= 90 ? "text-green-600" : "text-gray-800"}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-600" /> Fee Collection Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Total Invoiced: </span>
                <span className="font-semibold">₵{totalInvoiced.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Collected: </span>
                <span className="font-semibold text-green-600">₵{totalPaid.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Outstanding: </span>
                <span className="font-semibold text-red-600">₵{(totalInvoiced - totalPaid).toLocaleString()}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Student</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Admission</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Fee Group</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Total</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Paid</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Balance</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv: any) => {
                    const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
                    const overdue = new Date(inv.dueDate) < new Date() && inv.status !== "PAID";
                    return (
                      <tr key={inv.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50" : ""}`}>
                        <td className="px-3 py-2.5 font-medium">{inv.student?.firstName} {inv.student?.lastName}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{inv.student?.admissionNumber}</td>
                        <td className="px-3 py-2.5 text-gray-600">{inv.feeGroup?.name}</td>
                        <td className="px-3 py-2.5">₵{Number(inv.totalAmount).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-green-600">₵{Number(inv.paidAmount).toLocaleString()}</td>
                        <td className="px-3 py-2.5">
                          <span className={`font-semibold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                            ₵{balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            inv.status === "PAID" ? "bg-green-100 text-green-700" :
                            inv.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {overdue && inv.status !== "PAID" ? "OVERDUE" : inv.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
