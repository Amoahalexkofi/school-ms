import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { AdmissionsClient } from "./AdmissionsClient";

async function getApplications() {
  return ((await getDb()) as any).admissionApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdmissionsPage() {
  const applications = await getApplications();

  const pending  = applications.filter((a: any) => a.status === "PENDING").length;
  const approved = applications.filter((a: any) => a.status === "APPROVED").length;
  const enrolled = applications.filter((a: any) => !!a.enrolledStudentId).length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Admissions" />
      <main className="flex-1 p-4 md:p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Applications</p>
              <p className="text-3xl font-bold">{applications.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className={`text-3xl font-bold ${pending > 0 ? "text-yellow-600" : "text-gray-800"}`}>{pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600 tabular-nums">{approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Enrolled</p>
              <p className="text-3xl font-bold text-emerald-600 tabular-nums">{enrolled}</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-600" /> Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdmissionsClient applications={applications} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
