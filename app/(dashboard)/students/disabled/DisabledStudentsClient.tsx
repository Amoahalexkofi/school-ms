"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserX, RotateCcw } from "lucide-react";

export function DisabledStudentsClient({ students: initial }: { students: any[] }) {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function enable(id: string) {
    if (!confirm("Re-enable this student? They will appear in the active list again.")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, disableReason: null, disableNote: null, disabledAt: null }),
      });
      if (!res.ok) throw new Error();
      setStudents((s) => s.filter((x) => x.id !== id));
      router.refresh();
    } catch { alert("Failed to re-enable student"); }
    finally { setBusy(null); }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Link>

      <Card>
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <UserX className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No disabled students.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Adm No.", "Student Name", "Class / Section", "Reason", "Note", "Disabled On", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((s) => {
                    const cs = s.sessions?.[0]?.classSection;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                        <td className="px-4 py-3 font-medium">{s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}</td>
                        <td className="px-4 py-3 text-gray-600">{cs ? `${cs.class.name} – ${cs.section.name}` : "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{s.disableReason ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{s.disableNote ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{s.disabledAt ? new Date(s.disabledAt).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" disabled={busy === s.id} onClick={() => enable(s.id)}>
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> {busy === s.id ? "…" : "Re-enable"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
