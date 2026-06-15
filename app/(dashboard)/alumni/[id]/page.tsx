import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Briefcase, MapPin, GraduationCap, User } from "lucide-react";

export default async function AlumniProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const alumni = await ((await getDb()) as any).alumni.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          sessions: {
            include: {
              session: { select: { session: true } },
              classSection: {
                include: {
                  class: { select: { name: true } },
                  section: { select: { name: true } },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!alumni) notFound();
  const s = alumni.student;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`${s.firstName} ${s.lastName}`} />
      <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
        <Link href="/alumni" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Alumni
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{s.firstName} {s.lastName}</h2>
              <p className="text-indigo-200 text-sm">{s.admissionNo}</p>
              {alumni.occupation && <p className="text-indigo-100 mt-1">{alumni.occupation}</p>}
            </div>
            <div className="ml-auto">
              <Badge className="bg-white/20 text-white border-white/30">Alumni</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Contact Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /> Current Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Mail,     label: "Email",      value: alumni.currentEmail },
                { icon: Phone,    label: "Phone",      value: alumni.currentPhone },
                { icon: Briefcase,label: "Occupation", value: alumni.occupation },
                { icon: MapPin,   label: "Address",    value: alumni.address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium">{value || "—"}</p>
                  </div>
                </div>
              ))}
              {alumni.note && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Note</p>
                  <p className="text-sm text-gray-600">{alumni.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* School Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-purple-600" /> School History</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Full Name",     value: `${s.firstName} ${s.middleName ?? ""} ${s.lastName}`.trim() },
                { label: "Admission No",  value: s.admissionNo },
                { label: "Gender",        value: s.gender },
                { label: "Date of Birth", value: s.dob ? new Date(s.dob).toLocaleDateString() : null },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ) : null)}
            </CardContent>
          </Card>
        </div>

        {/* Academic Sessions */}
        {s.sessions?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Academic Sessions</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Session</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Class</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Section</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Roll No</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {s.sessions.map((sess: any) => (
                    <tr key={sess.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">{sess.session?.session}</td>
                      <td className="px-4 py-2.5">{sess.classSection?.class?.name ?? "—"}</td>
                      <td className="px-4 py-2.5">{sess.classSection?.section?.name ?? "—"}</td>
                      <td className="px-4 py-2.5 text-gray-500">{sess.rollNo ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
