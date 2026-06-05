import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Briefcase, DollarSign, BookOpen, Share2 } from "lucide-react";
import { StaffProfileActions } from "./StaffProfileActions";

async function getData(id: string) {
  const [staff, departments, designations] = await Promise.all([
    (prisma as any).staff.findUnique({
      where: { id },
      include: {
        user:        { select: { email: true, role: true } },
        department:  true,
        designation: true,
        teacherSubjects: { include: { subject: { select: { name: true, code: true } } } },
        classSectionsTeaching: { include: { class: true, section: true } },
        payslips:      { orderBy: { createdAt: "desc" }, take: 6 },
        leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),
    (prisma as any).department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (prisma as any).designation.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return { staff, departments, designations };
}

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { staff, departments, designations } = await getData(id);
  if (!staff) notFound();

  const dob    = staff.dob          ? new Date(staff.dob).toLocaleDateString()          : "—";
  const joined = staff.dateOfJoining ? new Date(staff.dateOfJoining).toLocaleDateString() : "—";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Staff Profile" />
      <main className="flex-1 p-6 space-y-6 max-w-5xl">
        <Link href="/staff" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff
        </Link>

        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {staff.firstName[0]}{staff.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{staff.firstName} {staff.lastName}</h1>
                    <p className="text-sm text-gray-500 font-mono">{staff.employeeId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${staff.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {staff.isActive ? "Active" : "Inactive"}
                    </span>
                    <StaffProfileActions staff={staff} departments={departments} designations={designations} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm">
                  {[
                    ["Role",         staff.user?.role?.replace(/_/g, " ")],
                    ["Department",   staff.department?.name],
                    ["Designation",  staff.designation?.name],
                    ["Gender",       staff.gender],
                    ["Date of Birth",    dob],
                    ["Date of Joining",  joined],
                    ["Contact",      staff.contactNo],
                    ["Email",        staff.user?.email],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                      <p className="text-gray-700 text-sm">{(value as string) ?? "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                ["Father's Name",    staff.fatherName],
                ["Mother's Name",    staff.motherName],
                ["Marital Status",   staff.maritalStatus],
                ["Religion",         staff.religion],
                ["Qualification",    staff.qualification],
                ["Work Experience",  staff.workExperience],
                ["Contract Type",    staff.contractType],
                ["Shift",            staff.shift],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-gray-700">{(value as string) ?? "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Employment / Financial */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" /> Employment &amp; Finance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                ["Payscale",          staff.payscale],
                ["Basic Salary",      staff.basicSalary ? `₵${Number(staff.basicSalary).toLocaleString()}` : null],
                ["Bank Name",         staff.bankName],
                ["Account No.",       staff.bankAccountNo],
                ["IFSC / Sort Code",  staff.ifscCode],
                ["Bank Branch",       staff.bankBranch],
                ["EPF / Pension No.", staff.epfNo],
                ["Location",          staff.location],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-gray-700">{(value as string) ?? "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact / Address */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-teal-600" /> Contact &amp; Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
            {[
              ["Emergency Contact", staff.emergencyContact],
              ["Local Address",     staff.localAddress],
              ["Permanent Address", staff.permanentAddress],
              ["City",              staff.city],
              ["State / Region",    staff.state],
              ["Country",           staff.country],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-gray-700">{(value as string) ?? "—"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subjects taught */}
        {staff.teacherSubjects.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" /> Subjects Taught
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {staff.teacherSubjects.map((ts: any) => (
                  <span key={ts.id} className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                    {ts.subject.name}
                    {ts.subject.code && <span className="text-indigo-400 ml-1">({ts.subject.code})</span>}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Class teacher of */}
        {staff.classSectionsTeaching.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-orange-600" /> Class Teacher Of
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {staff.classSectionsTeaching.map((cs: any) => (
                  <span key={cs.id} className="text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
                    {cs.class.name} – {cs.section.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social links */}
        {(staff.facebook || staff.twitter || staff.linkedin || staff.instagram) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Share2 className="h-4 w-4 text-sky-600" /> Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-sm">
              {staff.facebook  && <a href={staff.facebook}  target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Facebook</a>}
              {staff.twitter   && <a href={staff.twitter}   target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">Twitter / X</a>}
              {staff.linkedin  && <a href={staff.linkedin}  target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>}
              {staff.instagram && <a href={staff.instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline">Instagram</a>}
            </CardContent>
          </Card>
        )}

        {/* Recent payslips */}
        {staff.payslips.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" /> Recent Payslips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Period</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Basic</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Net</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staff.payslips.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{p.month}/{p.year}</td>
                      <td className="px-3 py-2">₵{Number(p.basicSalary).toLocaleString()}</td>
                      <td className="px-3 py-2 font-medium">₵{Number(p.netSalary).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === "PAID"     ? "bg-green-100 text-green-700"
                          : p.status === "APPROVED" ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {staff.note && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-amber-700">Note</p>
              <p className="text-sm text-amber-600 mt-1">{staff.note}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
