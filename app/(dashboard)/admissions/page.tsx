import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CheckCircle, XCircle, Clock } from "lucide-react";

async function getApplications() {
  return ((await getDb()) as any).admissionApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  PENDING: { color: "bg-amber-500/10 text-amber-400", icon: null },
  REVIEWED: { color: "bg-blue-500/10 text-blue-400", icon: null },
  APPROVED: { color: "bg-emerald-500/10 text-emerald-400", icon: null },
  REJECTED: { color: "bg-red-500/10 text-red-400", icon: null },
};

export default async function AdmissionsPage() {
  const applications = await getApplications();

  const pending = applications.filter((a: any) => a.status === "PENDING").length;
  const approved = applications.filter((a: any) => a.status === "APPROVED").length;
  const rejected = applications.filter((a: any) => a.status === "REJECTED").length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Admissions" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-white/40 mb-1">Total Applications</p>
              <p className="text-3xl font-bold">{applications.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-white/40 mb-1">Pending</p>
              <p className={`text-3xl font-bold ${pending > 0 ? "text-yellow-400" : "text-white/70"}`}>{pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-white/40 mb-1">Approved</p>
              <p className="text-3xl font-bold text-emerald-400">{approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-white/40 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-400">{rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-400" /> Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">No applications received yet.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-[#0f1015]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {app.firstName} {app.lastName}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[app.status]?.color ?? "bg-white/[0.04] text-white/50"}`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-white/40">
                          <span>DOB: {new Date(app.dateOfBirth).toLocaleDateString()}</span>
                          <span>Gender: {app.gender}</span>
                          <span>Class: {app.classAppliedFor}</span>
                          <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1.5 text-xs text-white/50">
                          <span className="font-medium">Parent:</span> {app.parentName} · {app.parentPhone}
                          {app.parentEmail && <span> · {app.parentEmail}</span>}
                        </div>
                        {app.address && <p className="text-xs text-white/40 mt-0.5">Address: {app.address}</p>}
                        {app.notes && <p className="text-xs text-white/40 mt-0.5 italic">{app.notes}</p>}
                        {app.reviewNote && (
                          <p className={`text-xs mt-1 px-2 py-1 rounded ${
                            app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            Review note: {app.reviewNote}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {app.status === "APPROVED" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : app.status === "REJECTED" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
