import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Briefcase, DollarSign, BookOpen, Share2, CreditCard } from "lucide-react";
import { StaffProfileActions, StaffAvatar } from "./StaffProfileActions";
import { StaffSubjectsManager } from "./StaffSubjectsManager";

async function getData(id: string) {
  const db = await getDb();
  const [staff, departments, designations, allSubjects] = await Promise.all([
    (db as any).staff.findUnique({
      where: { id },
      include: {
        user:        { select: { email: true, role: true } },
        department:  true,
        designation: true,
        teacherSubjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
        classSectionsTeaching: { include: { class: true, section: true } },
        payslips:      { orderBy: { createdAt: "desc" }, take: 6 },
        leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),
    (db as any).department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (db as any).designation.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (db as any).subject.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, code: true } }),
  ]);
  return { staff, departments, designations, allSubjects };
}

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { staff, departments, designations, allSubjects } = await getData(id);
  if (!staff) notFound();

  const dob    = staff.dob          ? new Date(staff.dob).toLocaleDateString()          : "—";
  const joined = staff.dateOfJoining ? new Date(staff.dateOfJoining).toLocaleDateString() : "—";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Staff Profile" />
      <main className="flex-1 p-6 space-y-6 max-w-5xl">
        <Link href="/staff" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff
        </Link>

        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <StaffAvatar
                staffId={staff.id}
                image={staff.image}
                initials={`${staff.firstName[0]}${staff.lastName[0]}`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-white/80">{staff.firstName} {staff.lastName}</h1>
                    <p className="text-sm text-white/40 font-mono">{staff.employeeId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${staff.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {staff.isActive ? "Active" : "Inactive"}
                    </span>
                    <Link href={`/staff/${staff.id}/id-card`}>
                      <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/[0.06] bg-[#111318] hover:bg-[#0f1015] text-white/50 font-medium">
                        <CreditCard className="h-3.5 w-3.5" /> ID Card
                      </button>
                    </Link>
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
                      <p className="text-xs text-white/30 uppercase tracking-wide">{label}</p>
                      <p className="text-white/60 text-sm">{(value as string) ?? "—"}</p>
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
                <User className="h-4 w-4 text-white/50" /> Personal Details
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
                  <p className="text-xs text-white/30">{label}</p>
                  <p className="text-white/60">{(value as string) ?? "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Employment / Financial */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-400" /> Employment &amp; Finance
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
                  <p className="text-xs text-white/30">{label}</p>
                  <p className="text-white/60">{(value as string) ?? "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact / Address */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-teal-400" /> Contact &amp; Address
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
                <p className="text-xs text-white/30">{label}</p>
                <p className="text-white/60">{(value as string) ?? "—"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subjects taught — interactive manager */}
        <StaffSubjectsManager
          staffId={staff.id}
          assigned={staff.teacherSubjects.map((ts: any) => ts.subject)}
          allSubjects={allSubjects}
        />

        {/* Class teacher of */}
        {staff.classSectionsTeaching.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-orange-400" /> Class Teacher Of
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {staff.classSectionsTeaching.map((cs: any) => (
                  <span key={cs.id} className="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
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
                <Share2 className="h-4 w-4 text-sky-400" /> Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-sm">
              {staff.facebook  && <a href={staff.facebook}  target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Facebook</a>}
              {staff.twitter   && <a href={staff.twitter}   target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">Twitter / X</a>}
              {staff.linkedin  && <a href={staff.linkedin}  target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
              {staff.instagram && <a href={staff.instagram} target="_blank" rel="noreferrer" className="text-pink-400 hover:underline">Instagram</a>}
            </CardContent>
          </Card>
        )}

        {/* Recent payslips */}
        {staff.payslips.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" /> Recent Payslips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="bg-[#0f1015]">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-white/50">Period</th>
                    <th className="text-left px-3 py-2 font-medium text-white/50">Basic</th>
                    <th className="text-left px-3 py-2 font-medium text-white/50">Net</th>
                    <th className="text-left px-3 py-2 font-medium text-white/50">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staff.payslips.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#0f1015]">
                      <td className="px-3 py-2 text-white/50">{p.month}/{p.year}</td>
                      <td className="px-3 py-2">₵{Number(p.basicSalary).toLocaleString()}</td>
                      <td className="px-3 py-2 font-medium">₵{Number(p.netSalary).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === "PAID"     ? "bg-emerald-500/10 text-emerald-400"
                          : p.status === "APPROVED" ? "bg-blue-500/10 text-blue-400"
                          : "bg-white/[0.04] text-white/50"
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
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-amber-400">Note</p>
              <p className="text-sm text-amber-400 mt-1">{staff.note}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
