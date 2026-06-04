import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

async function getAuditLogs() {
  return (prisma as any).auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

const entityColor: Record<string, string> = {
  Student: "bg-blue-100 text-blue-700",
  Staff: "bg-purple-100 text-purple-700",
  FeeInvoice: "bg-yellow-100 text-yellow-700",
  FeePayment: "bg-green-100 text-green-700",
  Attendance: "bg-orange-100 text-orange-700",
  ExamGroup: "bg-red-100 text-red-700",
  Homework: "bg-pink-100 text-pink-700",
  AdmissionApplication: "bg-indigo-100 text-indigo-700",
};

export default async function AuditLogPage() {
  const logs = await getAuditLogs();

  const entities = [...new Set(logs.map((l: any) => l.entity))];
  const today = logs.filter((l: any) => {
    const d = new Date(l.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Audit Log" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Events</p>
              <p className="text-3xl font-bold">{logs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold">{today}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Entities Tracked</p>
              <p className="text-3xl font-bold">{entities.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Log table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" /> Activity Log (last 200 events)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No audit events recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Time</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">User</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Action</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Entity</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Entity ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-700">
                          {log.userEmail ?? log.userId ?? "System"}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-800">{log.action}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entityColor[log.entity] ?? "bg-gray-100 text-gray-600"}`}>
                            {log.entity}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-400 truncate max-w-[120px]">
                          {log.entityId ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
