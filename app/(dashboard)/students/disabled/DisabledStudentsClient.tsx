"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, UserX, RotateCcw, Settings2, Trash2 } from "lucide-react";

type Reason = { id: string; reason: string; isActive: boolean };

export function DisabledStudentsClient({
  students: initial,
  reasons: initialReasons = [],
  canManageReasons = false,
}: {
  students: any[];
  reasons?: Reason[];
  canManageReasons?: boolean;
}) {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Reason[]>(initialReasons);
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [reasonBusy, setReasonBusy] = useState(false);

  async function addReason() {
    if (!newReason.trim()) return;
    setReasonBusy(true); setReasonError("");
    try {
      const res = await fetch("/api/disable-reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: newReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add reason");
      setReasons(r => [...r, data].sort((a, b) => a.reason.localeCompare(b.reason)));
      setNewReason("");
    } catch (e: any) { setReasonError(e.message); }
    finally { setReasonBusy(false); }
  }

  async function deleteReason(id: string) {
    setReasonBusy(true); setReasonError("");
    try {
      const res = await fetch(`/api/disable-reasons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete reason");
      setReasons(r => r.filter(x => x.id !== id));
    } catch (e: any) { setReasonError(e.message); }
    finally { setReasonBusy(false); }
  }

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
      <div className="flex items-center justify-between">
        <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        {canManageReasons && (
          <Button size="sm" variant="outline" onClick={() => { setReasonError(""); setReasonsOpen(true); }}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> Manage Reasons
          </Button>
        )}
      </div>

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

      {/* Disable Reason master (Smart School's disable_reason table) */}
      <Dialog open={reasonsOpen} onOpenChange={o => !o && setReasonsOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Reasons</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            These appear in the reason dropdown when disabling a student.
          </p>
          <div className="flex gap-2 mt-2">
            <Input value={newReason} placeholder="e.g. Transferred"
              onChange={e => setNewReason(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addReason(); } }} />
            <Button disabled={reasonBusy || !newReason.trim()} onClick={addReason}>Add</Button>
          </div>
          {reasonError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{reasonError}</p>}
          <div className="mt-2 divide-y border rounded-md">
            {reasons.length === 0 ? (
              <p className="text-sm text-gray-400 px-3 py-4 text-center">
                No reasons yet. Add ones like Transferred, Withdrawn, Graduated.
              </p>
            ) : reasons.map(r => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm">{r.reason}</span>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600"
                  disabled={reasonBusy} onClick={() => deleteReason(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
