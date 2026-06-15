"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Users, GraduationCap, Save } from "lucide-react";

const STAFF_ROLES = ["TEACHER", "ACCOUNTANT", "LIBRARIAN", "ADMIN", "SUPER_ADMIN"];
const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

export function AttendanceSettingsClient({
  classSections, attendanceTypes, staffAttendanceTypes,
  studentSchedules, staffSchedules,
}: {
  classSections: any[]; attendanceTypes: any[]; staffAttendanceTypes: any[];
  studentSchedules: any[]; staffSchedules: any[];
}) {
  const [tab, setTab] = useState<"student" | "staff">("student");

  // Student schedules keyed by "classSectionId_attendanceTypeId"
  const [studentRows, setStudentRows] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    for (const s of studentSchedules) {
      map[`${s.classSectionId}_${s.attendanceTypeId}`] = { entryTimeFrom: s.entryTimeFrom, entryTimeTo: s.entryTimeTo, totalHours: s.totalHours ?? "" };
    }
    return map;
  });

  // Staff schedules keyed by "role_attendanceTypeId"
  const [staffRows, setStaffRows] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    for (const s of staffSchedules) {
      map[`${s.role}_${s.staffAttendanceTypeId}`] = { entryTimeFrom: s.entryTimeFrom, entryTimeTo: s.entryTimeTo, totalHours: s.totalHours ?? "" };
    }
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateStudent(csId: string, typeId: string, field: string, value: string) {
    const key = `${csId}_${typeId}`;
    setStudentRows((r) => ({ ...r, [key]: { ...(r[key] ?? {}), [field]: value } }));
    setSaved(false);
  }

  function updateStaff(role: string, typeId: string, field: string, value: string) {
    const key = `${role}_${typeId}`;
    setStaffRows((r) => ({ ...r, [key]: { ...(r[key] ?? {}), [field]: value } }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      if (tab === "student") {
        const schedules = [];
        for (const [key, val] of Object.entries(studentRows)) {
          if (!val.entryTimeFrom || !val.entryTimeTo) continue;
          const [classSectionId, attendanceTypeId] = key.split("_");
          schedules.push({ classSectionId, attendanceTypeId, ...val });
        }
        if (schedules.length > 0) {
          await fetch("/api/attendance-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "student", schedules }) });
        }
      } else {
        const schedules = [];
        for (const [key, val] of Object.entries(staffRows)) {
          if (!val.entryTimeFrom || !val.entryTimeTo) continue;
          const [role, staffAttendanceTypeId] = key.split("_");
          schedules.push({ role, staffAttendanceTypeId, ...val });
        }
        if (schedules.length > 0) {
          await fetch("/api/attendance-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "staff", schedules }) });
        }
      }
      setSaved(true);
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  return (
    <main className="flex-1 p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div>
        <h2 className="text-lg font-bold">Attendance Settings</h2>
        <p className="text-sm text-white/40 mt-0.5">Configure attendance time windows per class-section (students) and per role (staff). The system uses these times to auto-detect attendance type when marking.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([["student", "Student Attendance", GraduationCap], ["staff", "Staff Attendance", Users]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => { setTab(id); setSaved(false); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-blue-600 text-blue-400" : "border-transparent text-white/40 hover:text-white/60"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {tab === "student" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" /> Class-Section Time Windows
            </CardTitle>
            <p className="text-xs text-white/30">Set the entry time range for each attendance type per class-section. Leave blank to skip.</p>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-white/50 min-w-[160px]">Class – Section</th>
                  {attendanceTypes.map((t: any) => (
                    <th key={t.id} className="text-center px-3 py-3 font-medium text-white/50 min-w-[220px]">
                      {t.type} ({t.keyValue})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {classSections.map((cs: any) => (
                  <tr key={cs.id} className="hover:bg-[#0f1015]">
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                      {cs.class?.name} – {cs.section?.name}
                    </td>
                    {attendanceTypes.map((t: any) => {
                      const key = `${cs.id}_${t.id}`;
                      const row = studentRows[key] ?? {};
                      return (
                        <td key={t.id} className="px-3 py-2">
                          <div className="flex gap-1 items-center">
                            <Input type="time" value={row.entryTimeFrom ?? ""} onChange={(e) => updateStudent(cs.id, t.id, "entryTimeFrom", e.target.value)} className="h-7 text-xs w-24" />
                            <span className="text-white/30 text-xs">–</span>
                            <Input type="time" value={row.entryTimeTo ?? ""} onChange={(e) => updateStudent(cs.id, t.id, "entryTimeTo", e.target.value)} className="h-7 text-xs w-24" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "staff" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400" /> Role-wise Time Windows
            </CardTitle>
            <p className="text-xs text-white/30">Set entry time range per staff role and attendance type.</p>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-white/50">Role</th>
                  {staffAttendanceTypes.map((t: any) => (
                    <th key={t.id} className="text-center px-3 py-3 font-medium text-white/50 min-w-[220px]">
                      {t.type} ({t.keyValue})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {STAFF_ROLES.map((role) => (
                  <tr key={role} className="hover:bg-[#0f1015]">
                    <td className="px-4 py-2.5 font-medium">{role}</td>
                    {staffAttendanceTypes.map((t: any) => {
                      const key = `${role}_${t.id}`;
                      const row = staffRows[key] ?? {};
                      return (
                        <td key={t.id} className="px-3 py-2">
                          <div className="flex gap-1 items-center">
                            <Input type="time" value={row.entryTimeFrom ?? ""} onChange={(e) => updateStaff(role, t.id, "entryTimeFrom", e.target.value)} className="h-7 text-xs w-24" />
                            <span className="text-white/30 text-xs">–</span>
                            <Input type="time" value={row.entryTimeTo ?? ""} onChange={(e) => updateStaff(role, t.id, "entryTimeTo", e.target.value)} className="h-7 text-xs w-24" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Settings"}
        </Button>
        {saved && <span className="text-sm text-emerald-400 font-medium">Settings saved</span>}
      </div>
    </main>
  );
}
