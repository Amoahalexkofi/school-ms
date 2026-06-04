"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, AlertCircle, Users } from "lucide-react";

type Status = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";

const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: "PRESENT", label: "Present", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "ABSENT", label: "Absent", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "LATE", label: "Late", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "HALF_DAY", label: "Half Day", color: "bg-orange-100 text-orange-700 border-orange-300" },
];

const SECTION_ID = "section-g1-a";
const SESSION_ID = "session-2026";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setStudents(list);
        const map: Record<string, Status> = {};
        list.forEach((s: any) => { map[s.id] = "PRESENT"; });
        setStatusMap(map);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: SECTION_ID,
          sessionId: SESSION_ID,
          date: today,
          records: Object.entries(statusMap).map(([studentId, status]) => ({ studentId, status })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const counts = Object.values(statusMap).reduce<Record<string, number>>((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Attendance" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Grade 1 – Section A &nbsp;·&nbsp; {today}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const map: Record<string, Status> = {};
                students.forEach((s) => { map[s.id] = "PRESENT"; });
                setStatusMap(map);
              }}
            >
              Mark All Present
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || students.length === 0}>
              {saving ? "Saving…" : saved ? "✓ Saved" : "Save Attendance"}
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUSES.map(({ value, label, color }) => (
            <Card key={value} className="border">
              <CardContent className="pt-4 pb-3">
                <div className="text-2xl font-bold">{counts[value] ?? 0}</div>
                <div className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${color}`}>{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading students…</div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No students found in this section.
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Admission No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {STATUSES.map(({ value, label, color }) => (
                          <button
                            key={value}
                            onClick={() => setStatusMap((m) => ({ ...m, [s.id]: value }))}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                              statusMap[s.id] === value
                                ? color + " ring-2 ring-offset-1 ring-current"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
