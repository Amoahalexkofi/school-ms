import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Mail, Phone } from "lucide-react";

async function getMessagingData() {
  const [logs, counts] = await Promise.all([
    (prisma as any).messageLog.findMany({
      include: { sentBy: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    Promise.all([
      (prisma as any).parent.count(),
      (prisma as any).staff.count(),
      (prisma as any).student.count(),
    ]),
  ]);
  return { logs, parentCount: counts[0], staffCount: counts[1], studentCount: counts[2] };
}

const channelIcon: Record<string, React.ReactNode> = {
  SMS:    <Phone className="h-3.5 w-3.5" />,
  EMAIL:  <Mail className="h-3.5 w-3.5" />,
  IN_APP: <MessageSquare className="h-3.5 w-3.5" />,
};

const channelColor: Record<string, string> = {
  SMS:    "bg-green-100 text-green-700",
  EMAIL:  "bg-blue-100 text-blue-700",
  IN_APP: "bg-purple-100 text-purple-700",
};

const recipientLabel: Record<string, string> = {
  ALL_PARENTS:  "All Parents",
  ALL_STAFF:    "All Staff",
  ALL_STUDENTS: "All Students",
  ALL:          "Everyone",
};

export default async function MessagingPage() {
  const { logs, parentCount, staffCount, studentCount } = await getMessagingData();

  const totalSent = logs.reduce((s: number, l: any) => s + l.recipientCount, 0);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Messaging" />
      <main className="flex-1 p-6 space-y-8">

        {/* Audience overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Parents</p>
              <p className="text-3xl font-bold">{parentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Staff</p>
              <p className="text-3xl font-bold">{staffCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Students</p>
              <p className="text-3xl font-bold">{studentCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Message log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-600" /> Message Log
              </span>
              <span className="text-sm font-normal text-gray-500">{totalSent.toLocaleString()} total recipients reached</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No messages sent yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log: any) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{log.subject}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${channelColor[log.channel]}`}>
                            {channelIcon[log.channel]}
                            {log.channel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{log.message}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          <span>To: <span className="text-gray-600 font-medium">{recipientLabel[log.recipientType] ?? log.recipientType}</span></span>
                          <span>{log.recipientCount.toLocaleString()} recipients</span>
                          {log.sentBy && <span>By: {log.sentBy.firstName} {log.sentBy.lastName}</span>}
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-blue-600">{log.recipientCount}</p>
                        <p className="text-xs text-gray-400">sent</p>
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
