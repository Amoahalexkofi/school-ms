import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, ClipboardList } from "lucide-react";

async function getFrontOfficeData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [visitorsToday, allVisitors, complaints, enquiries] = await Promise.all([
    (prisma as any).visitor.count({ where: { inTime: { gte: today, lt: tomorrow } } }),
    (prisma as any).visitor.findMany({ orderBy: { inTime: "desc" }, take: 20 }),
    (prisma as any).complaint.findMany({ orderBy: { createdAt: "desc" } }),
    (prisma as any).enquiry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return { visitorsToday, allVisitors, complaints, enquiries };
}

const complaintStatusColor: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const enquiryStatusColor: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default async function FrontOfficePage() {
  const { visitorsToday, allVisitors, complaints, enquiries } = await getFrontOfficeData();

  const openComplaints = complaints.filter((c: any) => c.status !== "RESOLVED").length;
  const newEnquiries = enquiries.filter((e: any) => e.status === "NEW").length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Front Office" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Visitors Today</p>
              <p className="text-3xl font-bold">{visitorsToday}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Visitors</p>
              <p className="text-3xl font-bold">{allVisitors.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Open Complaints</p>
              <p className={`text-3xl font-bold ${openComplaints > 0 ? "text-red-600" : "text-gray-800"}`}>
                {openComplaints}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">New Enquiries</p>
              <p className={`text-3xl font-bold ${newEnquiries > 0 ? "text-blue-600" : "text-gray-800"}`}>
                {newEnquiries}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visitor Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" /> Visitor Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allVisitors.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No visitors recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Visitor</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Phone</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Purpose</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Host</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">In</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Out</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allVisitors.map((v: any) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium">{v.name}</td>
                        <td className="px-3 py-2.5 text-gray-500">{v.phone ?? "—"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{v.purpose}</td>
                        <td className="px-3 py-2.5 text-gray-500">{v.host ?? "—"}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500">
                          {new Date(v.inTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" "}
                          {new Date(v.inTime).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-500">
                          {v.outTime
                            ? new Date(v.outTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            v.outTime ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
                          }`}>
                            {v.outTime ? "Left" : "On Premises"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-500" /> Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No complaints filed.</p>
            ) : (
              <div className="space-y-3">
                {complaints.map((c: any) => (
                  <div key={c.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Raised by: {c.raisedBy}</p>
                        <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                        {c.resolution && (
                          <p className="text-xs text-green-700 mt-1 bg-green-50 px-2 py-1 rounded">
                            Resolution: {c.resolution}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${complaintStatusColor[c.status]}`}>
                          {c.status.replace("_", " ")}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enquiries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-600" /> Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enquiries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No enquiries received.</p>
            ) : (
              <div className="space-y-3">
                {enquiries.map((e: any) => (
                  <div key={e.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{e.name}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                          {e.phone && <span>{e.phone}</span>}
                          {e.email && <span>{e.email}</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{e.message}</p>
                        {e.followUpNote && (
                          <p className="text-xs text-purple-700 mt-1 bg-purple-50 px-2 py-1 rounded">
                            Follow-up: {e.followUpNote}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${enquiryStatusColor[e.status]}`}>
                          {e.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{new Date(e.createdAt).toLocaleDateString()}</p>
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
