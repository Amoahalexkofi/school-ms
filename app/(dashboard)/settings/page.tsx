import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, GraduationCap, BookOpen, Layers } from "lucide-react";

async function getSettingsData() {
  const [sessions, classes, subjects] = await Promise.all([
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).class.findMany({
      include: { session: true, sections: true, _count: { select: { subjects: true } } },
      orderBy: { name: "asc" },
    }),
    (prisma as any).subject.findMany({
      include: { class: { include: { session: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  return { sessions, classes, subjects };
}

export default async function SettingsPage() {
  const { sessions, classes, subjects } = await getSettingsData();

  const activeSession = sessions.find((s: any) => s.isActive);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Settings" />
      <main className="flex-1 p-6 space-y-8">

        {/* Academic Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" /> Academic Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No sessions created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Start</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">End</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sessions.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium">{s.name}</td>
                        <td className="px-3 py-2.5 text-gray-500">{new Date(s.startDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5 text-gray-500">{new Date(s.endDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5">
                          {s.isActive ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classes & Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-600" /> Classes & Sections
              {activeSession && (
                <span className="text-xs text-gray-400 font-normal ml-1">(Active: {activeSession.name})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No classes created yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.map((cls: any) => (
                  <div key={cls.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{cls.name}</p>
                        <p className="text-xs text-gray-500">{cls.session.name} · {cls._count.subjects} subjects</p>
                      </div>
                      <span className="text-xs text-gray-500">{cls.sections.length} section{cls.sections.length !== 1 ? "s" : ""}</span>
                    </div>
                    {cls.sections.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cls.sections.map((sec: any) => (
                          <span key={sec.id} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                            <Layers className="h-3 w-3 inline mr-1" />{sec.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-600" /> Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No subjects created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Code</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Class</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Session</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subjects.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium">{sub.name}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{sub.code}</td>
                        <td className="px-3 py-2.5 text-gray-600">{sub.class.name}</td>
                        <td className="px-3 py-2.5 text-gray-400 text-xs">{sub.class.session.name}</td>
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
