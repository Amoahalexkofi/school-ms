import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

async function getLessonPlans() {
  return (prisma as any).lessonPlan.findMany({
    include: {
      staff: true,
      subject: true,
      section: { include: { class: true } },
    },
    orderBy: { date: "desc" },
  });
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  DRAFT:     { color: "bg-gray-100 text-gray-600",   icon: null },
  SUBMITTED: { color: "bg-blue-100 text-blue-700",   icon: null },
  APPROVED:  { color: "bg-green-100 text-green-700", icon: null },
};

export default async function LessonPlansPage() {
  const plans = await getLessonPlans();

  const submitted = plans.filter((p: any) => p.status === "SUBMITTED").length;
  const approved  = plans.filter((p: any) => p.status === "APPROVED").length;
  const drafts    = plans.filter((p: any) => p.status === "DRAFT").length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Lesson Plans" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Plans</p>
              <p className="text-3xl font-bold">{plans.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Drafts</p>
              <p className="text-3xl font-bold text-gray-500">{drafts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Submitted</p>
              <p className={`text-3xl font-bold ${submitted > 0 ? "text-blue-600" : "text-gray-800"}`}>{submitted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{approved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> Lesson Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No lesson plans submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {plans.map((p: any) => (
                  <div key={p.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{p.topic}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[p.status]?.color}`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          <span>{p.subject.name} ({p.subject.code})</span>
                          <span>{p.section.class.name} – {p.section.name}</span>
                          <span>By: {p.staff.firstName} {p.staff.lastName}</span>
                          <span>{new Date(p.date).toLocaleDateString()}</span>
                        </div>
                        {p.description && (
                          <p className="text-sm text-gray-600 mt-1.5">{p.description}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {p.status === "APPROVED" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : p.status === "SUBMITTED" ? (
                          <Clock className="h-5 w-5 text-blue-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-300" />
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
