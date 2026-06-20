"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer, Search, FileText } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  sessions: { id: string; name: string }[];
  classes: { id: string; name: string }[];
  sections: { id: string; name: string }[];
  classSections: { id: string; class: { name: string }; section: { name: string } }[];
  departments: { id: string; name: string }[];
  examGroups: { id: string; name: string }[];
};

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type ReportTab =
  | "students"
  | "attendance"
  | "staff-attendance"
  | "fees"
  | "due-fees"
  | "exam-results"
  | "transport"
  | "library";

const TABS: { id: ReportTab; label: string }[] = [
  { id: "students", label: "Student List" },
  { id: "attendance", label: "Attendance" },
  { id: "staff-attendance", label: "Staff Attendance" },
  { id: "fees", label: "Fee Collection" },
  { id: "due-fees", label: "Due Fees" },
  { id: "exam-results", label: "Exam Results" },
  { id: "transport", label: "Transport" },
  { id: "library", label: "Library" },
];

// ─── CSV helper ───────────────────────────────────────────────────────────────

function downloadCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return alert("No data to export");
  const keys = Object.keys(rows[0]);
  const lines = [
    keys.join(","),
    ...rows.map((r) =>
      keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Per-branch subtotal chips (Multi Branch) ─────────────────────────────────
// Shows "Branch: total" chips, only when rows span more than one branch.
function BranchSummary({ rows, valueKey, prefix = "" }: { rows: any[]; valueKey: string; prefix?: string }) {
  const byBranch: Record<string, number> = {};
  for (const r of rows) {
    const b = r.branch || "—";
    byBranch[b] = (byBranch[b] ?? 0) + Number(r[valueKey] ?? 0);
  }
  const entries = Object.entries(byBranch).sort((a, b) => b[1] - a[1]);
  if (entries.length <= 1) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap print:hidden">
      {entries.map(([b, v]) => (
        <span key={b} className="text-[11px] font-medium px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
          {b}: <span className="font-semibold text-gray-800">{prefix}{v.toLocaleString(undefined, { minimumFractionDigits: prefix ? 2 : 0 })}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReportsClient({ sessions, classes, sections, classSections, departments, examGroups }: Props) {
  const perm = usePermission("reports");
  const [tab, setTab] = useState<ReportTab>("students");
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-4">
      {/* Tab nav */}
      <div className="flex gap-1 flex-wrap border-b print:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div ref={printRef}>
        {tab === "students" && (
          <StudentReport sessions={sessions} classes={classes} sections={sections} classSections={classSections} onPrint={handlePrint} />
        )}
        {tab === "attendance" && (
          <AttendanceReport sessions={sessions} classSections={classSections} onPrint={handlePrint} />
        )}
        {tab === "staff-attendance" && (
          <StaffAttendanceReport departments={departments} onPrint={handlePrint} />
        )}
        {tab === "fees" && (
          <FeeCollectionReport sessions={sessions} onPrint={handlePrint} />
        )}
        {tab === "due-fees" && (
          <DueFeesReport sessions={sessions} onPrint={handlePrint} />
        )}
        {tab === "exam-results" && (
          <ExamResultsReport examGroups={examGroups} sessions={sessions} classSections={classSections} onPrint={handlePrint} />
        )}
        {tab === "transport" && (
          <TransportReport onPrint={handlePrint} />
        )}
        {tab === "library" && (
          <LibraryReport onPrint={handlePrint} />
        )}
      </div>
    </main>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function ReportActions({ onPrint, onCSV, count }: { onPrint: () => void; onCSV: () => void; count: number }) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      <span className="text-sm text-gray-500">{count} record{count !== 1 ? "s" : ""}</span>
      <Button size="sm" variant="outline" onClick={onCSV}>
        <Download className="h-3.5 w-3.5 mr-1" /> CSV
      </Button>
      <Button size="sm" variant="outline" onClick={onPrint}>
        <Printer className="h-3.5 w-3.5 mr-1" /> Print
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-400">
      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p>Apply filters and click "Generate" to view the report.</p>
    </div>
  );
}

function LoadingState() {
  return <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>;
}

// ─── 1. Student List Report ───────────────────────────────────────────────────

function StudentReport({ sessions, classes, sections, classSections, onPrint }: {
  sessions: Props["sessions"]; classes: Props["classes"]; sections: Props["sections"];
  classSections: Props["classSections"]; onPrint: () => void;
}) {
  const [sessionId, setSessionId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("active");
  const [rows, setRows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sessionId) params.set("sessionId", sessionId);
      if (classId) params.set("classId", classId);
      if (sectionId) params.set("sectionId", sectionId);
      if (gender) params.set("gender", gender);
      if (status) params.set("status", status);
      const res = await fetch(`/api/reports/students?${params}`);
      setRows(await res.json());
    } catch { alert("Failed to load report"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!rows) return;
    downloadCSV(rows.map((s) => ({
      "Admission No": s.admissionNo,
      "First Name": s.firstName,
      "Last Name": s.lastName,
      "Gender": s.gender ?? "",
      "Class": s.sessions?.[0]?.classSection?.class?.name ?? "",
      "Section": s.sessions?.[0]?.classSection?.section?.name ?? "",
      "Session": s.sessions?.[0]?.session?.session ?? "",
      "Status": s.isActive ? "Active" : "Inactive",
      "Mobile": s.mobile ?? "",
      "Date of Birth": s.dob ? new Date(s.dob).toLocaleDateString() : "",
    })), "students.csv");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Student List Report</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <Label>Session</Label>
            <select className={SEL} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">All Sessions</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Class</Label>
            <select className={SEL} value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Section</Label>
            <select className={SEL} value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">All Sections</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Gender</Label>
            <select className={SEL} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select className={SEL} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Generate"}
          </Button>
          {rows && <ReportActions onPrint={onPrint} onCSV={csv} count={rows.length} />}
        </div>
      </div>

      {loading ? <LoadingState /> : rows === null ? <EmptyState /> : rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No students found.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b print:block hidden">
            <h2 className="text-lg font-bold">Student List Report</h2>
            <p className="text-xs text-gray-500">Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Admission No</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Gender</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Class</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Section</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Session</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((s, i) => {
                  const sess = s.sessions?.[0];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{s.admissionNo}</td>
                      <td className="px-4 py-2.5 font-medium">{s.firstName} {s.lastName}</td>
                      <td className="px-4 py-2.5 text-gray-500">{s.gender ?? "—"}</td>
                      <td className="px-4 py-2.5">{sess?.classSection?.class?.name ?? "—"}</td>
                      <td className="px-4 py-2.5">{sess?.classSection?.section?.name ?? "—"}</td>
                      <td className="px-4 py-2.5 text-gray-500">{sess?.session?.session ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{s.mobile ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2. Attendance Report ─────────────────────────────────────────────────────

function AttendanceReport({ sessions, classSections, onPrint }: {
  sessions: Props["sessions"]; classSections: Props["classSections"]; onPrint: () => void;
}) {
  const [sessionId, setSessionId] = useState("");
  const [classSectionId, setClassSectionId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<{ rows: any[]; totalDays: number } | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!sessionId || !from || !to) return alert("Please select session and date range");
    setLoading(true);
    try {
      const params = new URLSearchParams({ sessionId, from, to });
      if (classSectionId) params.set("classSectionId", classSectionId);
      const res = await fetch(`/api/reports/attendance?${params}`);
      setData(await res.json());
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!data) return;
    downloadCSV(data.rows.map((r) => ({
      "Admission No": r.student.admissionNo,
      "Name": `${r.student.firstName} ${r.student.lastName}`,
      "Branch": r.student.branch?.name ?? "",
      "Class": r.classSection?.class?.name ?? "",
      "Section": r.classSection?.section?.name ?? "",
      P: r.P, A: r.A, L: r.L, H: r.H, "Half Day": r.F,
      "Total": r.total, "%": r.pct,
    })), "attendance.csv");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Student Attendance Report</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>Session *</Label>
            <select className={SEL} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">Select session</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Class-Section</Label>
            <select className={SEL} value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)}>
              <option value="">All</option>
              {classSections.map((cs) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>From *</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To *</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Generate"}
          </Button>
          {data && <ReportActions onPrint={onPrint} onCSV={csv} count={data.rows.length} />}
        </div>
      </div>

      {loading ? <LoadingState /> : !data ? <EmptyState /> : data.rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No attendance records found.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Attendance Report</h2>
              <p className="text-xs text-gray-400">
                {from} to {to} · {data.totalDays} school day{data.totalDays !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Admission</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Branch</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Class</th>
                  <th className="text-center px-3 py-2.5 font-medium text-green-600">P</th>
                  <th className="text-center px-3 py-2.5 font-medium text-red-600">A</th>
                  <th className="text-center px-3 py-2.5 font-medium text-yellow-600">L</th>
                  <th className="text-center px-3 py-2.5 font-medium text-blue-600">H</th>
                  <th className="text-center px-3 py-2.5 font-medium text-purple-600">F</th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.rows.map((r, i) => (
                  <tr key={r.student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{r.student.firstName} {r.student.lastName}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{r.student.admissionNo}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.student.branch?.name ?? "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {r.classSection?.class?.name ?? ""} {r.classSection?.section?.name ?? ""}
                    </td>
                    <td className="text-center px-3 py-2.5 text-green-600 font-medium">{r.P}</td>
                    <td className="text-center px-3 py-2.5 text-red-600 font-medium">{r.A}</td>
                    <td className="text-center px-3 py-2.5 text-yellow-600 font-medium">{r.L}</td>
                    <td className="text-center px-3 py-2.5 text-indigo-600 font-medium">{r.H}</td>
                    <td className="text-center px-3 py-2.5 text-purple-600 font-medium">{r.F}</td>
                    <td className="text-center px-3 py-2.5">{r.total}</td>
                    <td className="text-right px-4 py-2.5">
                      <span className={`font-semibold ${r.pct < 75 ? "text-red-600" : r.pct >= 90 ? "text-green-600" : "text-gray-800"}`}>
                        {r.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 3. Staff Attendance Report ───────────────────────────────────────────────

function StaffAttendanceReport({ departments, onPrint }: { departments: Props["departments"]; onPrint: () => void }) {
  const [departmentId, setDepartmentId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!from || !to) return alert("Select date range");
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      if (departmentId) params.set("departmentId", departmentId);
      const res = await fetch(`/api/reports/staff-attendance?${params}`);
      setRows(await res.json());
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!rows) return;
    downloadCSV(rows.map((r) => ({
      "Employee ID": r.staff.employeeId ?? "",
      "Name": `${r.staff.firstName} ${r.staff.lastName}`,
      "Department": r.staff.department?.name ?? "",
      "Designation": r.staff.designation?.name ?? "",
      P: r.P, A: r.A, L: r.L, H: r.H, F: r.F,
      "Total": r.total, "%": r.pct,
    })), "staff-attendance.csv");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Staff Attendance Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Department</Label>
            <select className={SEL} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <Label>From *</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To *</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Generate"}
          </Button>
          {rows && <ReportActions onPrint={onPrint} onCSV={csv} count={rows.length} />}
        </div>
      </div>

      {loading ? <LoadingState /> : rows === null ? <EmptyState /> : rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No records found.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Employee ID</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Department</th>
                  <th className="text-center px-3 py-2.5 font-medium text-green-600">P</th>
                  <th className="text-center px-3 py-2.5 font-medium text-red-600">A</th>
                  <th className="text-center px-3 py-2.5 font-medium text-yellow-600">L</th>
                  <th className="text-center px-3 py-2.5 font-medium text-blue-600">H</th>
                  <th className="text-center px-3 py-2.5 font-medium text-purple-600">F</th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => (
                  <tr key={r.staff.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.staff.employeeId ?? "—"}</td>
                    <td className="px-4 py-2.5 font-medium">{r.staff.firstName} {r.staff.lastName}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.staff.department?.name ?? "—"}</td>
                    <td className="text-center px-3 py-2.5 text-green-600 font-medium">{r.P}</td>
                    <td className="text-center px-3 py-2.5 text-red-600 font-medium">{r.A}</td>
                    <td className="text-center px-3 py-2.5 text-yellow-600 font-medium">{r.L}</td>
                    <td className="text-center px-3 py-2.5 text-indigo-600 font-medium">{r.H}</td>
                    <td className="text-center px-3 py-2.5 text-purple-600 font-medium">{r.F}</td>
                    <td className="text-center px-3 py-2.5">{r.total}</td>
                    <td className="text-right px-4 py-2.5">
                      <span className={`font-semibold ${r.pct < 75 ? "text-red-600" : "text-gray-800"}`}>
                        {r.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 4. Fee Collection Report ─────────────────────────────────────────────────

function FeeCollectionReport({ sessions, onPrint }: { sessions: Props["sessions"]; onPrint: () => void }) {
  const [sessionId, setSessionId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<{ rows: any[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!from || !to) return alert("Select date range");
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      if (sessionId) params.set("sessionId", sessionId);
      const res = await fetch(`/api/reports/fees?${params}`);
      setData(await res.json());
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!data) return;
    downloadCSV(data.rows.map((r) => ({
      "Admission No": r.student.admissionNo,
      "Name": `${r.student.firstName} ${r.student.lastName}`,
      "Branch": r.branch ?? "",
      "Class": r.class, "Section": r.section, "Session": r.session,
      "Fee Group": r.feeGroup, "Fee Type": r.feeType,
      "Amount": r.amount.toFixed(2), "Payment Mode": r.paymentMode,
      "Pay Date": r.payDate ? new Date(r.payDate).toLocaleDateString() : "",
    })), "fee-collection.csv");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Fee Collection Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Session</Label>
            <select className={SEL} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">All Sessions</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label>From *</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To *</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Generate"}
          </Button>
          {data && <ReportActions onPrint={onPrint} onCSV={csv} count={data.rows.length} />}
        </div>
      </div>

      {loading ? <LoadingState /> : !data ? <EmptyState /> : data.rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No payments found in this period.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium">
              Total Collected: <span className="text-green-600 font-bold">₵{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </span>
            <BranchSummary rows={data.rows} valueKey="amount" prefix="₵" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Branch</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Class</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Fee Group</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Fee Type</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Amount</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Mode</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{r.student.firstName} {r.student.lastName}</p>
                      <p className="text-xs text-gray-400">{r.student.admissionNo}</p>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{r.branch || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.class} {r.section}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.feeGroup || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.feeType}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-green-700">
                      ₵{Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{r.paymentMode || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">
                      {r.payDate ? new Date(r.payDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td colSpan={6} className="px-4 py-2.5 text-right font-semibold text-sm">Total:</td>
                  <td className="px-4 py-2.5 text-right font-bold text-green-700">
                    ₵{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 5. Due Fees Report ───────────────────────────────────────────────────────

function DueFeesReport({ sessions, onPrint }: { sessions: Props["sessions"]; onPrint: () => void }) {
  const [sessionId, setSessionId] = useState("");
  const [rows, setRows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sessionId) params.set("sessionId", sessionId);
      const res = await fetch(`/api/reports/due-fees?${params}`);
      setRows(await res.json());
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!rows) return;
    downloadCSV(rows.map((r) => ({
      "Admission No": r.student.admissionNo,
      "Name": `${r.student.firstName} ${r.student.lastName}`,
      "Branch": r.branch ?? "",
      "Class": r.class, "Section": r.section,
      "Session": r.session, "Fee Group": r.feeGroup,
      "Total Fee": r.totalFee.toFixed(2),
      "Paid": r.paid.toFixed(2),
      "Due": r.due.toFixed(2),
    })), "due-fees.csv");
  }

  const totalDue = rows ? rows.reduce((s, r) => s + r.due, 0) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Due Fees Report (Defaulters)</h3>
        <div className="flex items-end gap-3">
          <div className="w-60">
            <Label>Session</Label>
            <select className={SEL} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">All Sessions</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Generate"}
          </Button>
          {rows && <ReportActions onPrint={onPrint} onCSV={csv} count={rows.length} />}
        </div>
      </div>

      {loading ? <LoadingState /> : rows === null ? <EmptyState /> : rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No outstanding fees found.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b bg-red-50 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium text-red-700">
              Total Outstanding: <span className="font-bold">₵{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <BranchSummary rows={rows} valueKey="due" prefix="₵" />
              <span className="text-xs text-red-500">{rows.length} defaulter{rows.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Branch</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Class</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Session</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Fee Group</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Paid</th>
                  <th className="text-right px-4 py-2.5 font-medium text-red-600">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => (
                  <tr key={`${r.student.id}-${i}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{r.student.firstName} {r.student.lastName}</p>
                      <p className="text-xs text-gray-400">{r.student.admissionNo}</p>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{r.branch || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.class} {r.section}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.session}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.feeGroup || "—"}</td>
                    <td className="px-4 py-2.5 text-right">₵{Number(r.totalFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right text-green-600">₵{Number(r.paid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-red-600">
                      ₵{Number(r.due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td colSpan={8} className="px-4 py-2.5 text-right font-semibold text-sm">Total Outstanding:</td>
                  <td className="px-4 py-2.5 text-right font-bold text-red-600">
                    ₵{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 6. Exam Results Report ───────────────────────────────────────────────────

function ExamResultsReport({ examGroups, sessions, classSections, onPrint }: {
  examGroups: Props["examGroups"]; sessions: Props["sessions"];
  classSections: Props["classSections"]; onPrint: () => void;
}) {
  const [examGroupId, setExamGroupId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [classSectionId, setClassSectionId] = useState("");
  const [data, setData] = useState<{ rows: any[]; subjectNames: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!examGroupId) return alert("Select an exam group");
    setLoading(true);
    try {
      const params = new URLSearchParams({ examGroupId });
      if (sessionId) params.set("sessionId", sessionId);
      if (classSectionId) params.set("classSectionId", classSectionId);
      const res = await fetch(`/api/reports/exam-results?${params}`);
      setData(await res.json());
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!data) return;
    downloadCSV(data.rows.map((r) => {
      const row: Record<string, any> = {
        "Rank": r.rank,
        "Admission No": r.student.admissionNo,
        "Name": `${r.student.firstName} ${r.student.lastName}`,
      };
      for (const sub of data.subjectNames) {
        const s = r.subjects[sub];
        row[`${sub} (${s?.full ?? 0})`] = s?.obtained ?? "AB";
      }
      row["Total"] = `${r.obtainedMarks}/${r.totalMarks}`;
      row["%"] = r.percentage;
      row["Result"] = r.passed ? "Pass" : "Fail";
      return row;
    }), "exam-results.csv");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Exam Results Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Exam Group *</Label>
            <select className={SEL} value={examGroupId} onChange={(e) => setExamGroupId(e.target.value)}>
              <option value="">Select exam group</option>
              {examGroups.map((eg) => <option key={eg.id} value={eg.id}>{eg.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Session</Label>
            <select className={SEL} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">All Sessions</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Class-Section</Label>
            <select className={SEL} value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)}>
              <option value="">All</option>
              {classSections.map((cs) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Generate"}
          </Button>
          {data && <ReportActions onPrint={onPrint} onCSV={csv} count={data.rows.length} />}
        </div>
      </div>

      {loading ? <LoadingState /> : !data ? <EmptyState /> : data.rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No results found. Ensure marks have been entered for this exam group.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">Rank</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">Student</th>
                  {data.subjectNames.map((sub) => (
                    <th key={sub} className="text-center px-2 py-2.5 font-medium text-gray-600 whitespace-nowrap">{sub}</th>
                  ))}
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600">Total</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600">%</th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.rows.map((r) => (
                  <tr key={r.student.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-center font-bold text-gray-400">#{r.rank}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{r.student.firstName} {r.student.lastName}</p>
                      <p className="text-xs text-gray-400">{r.student.admissionNo}</p>
                    </td>
                    {data.subjectNames.map((sub) => {
                      const s = r.subjects[sub];
                      return (
                        <td key={sub} className="text-center px-2 py-2.5">
                          {s ? (
                            s.attendance !== "P" ? (
                              <span className="text-xs text-gray-400">AB</span>
                            ) : (
                              <span className={s.isPassing ? "text-green-700" : "text-red-600"}>
                                {s.obtained}
                                <span className="text-xs text-gray-400">/{s.full}</span>
                              </span>
                            )
                          ) : "—"}
                        </td>
                      );
                    })}
                    <td className="text-right px-3 py-2.5 font-semibold">
                      {r.obtainedMarks}/{r.totalMarks}
                    </td>
                    <td className="text-right px-3 py-2.5 font-semibold">{r.percentage}%</td>
                    <td className="text-center px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {r.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 7. Transport Report ──────────────────────────────────────────────────────

function TransportReport({ onPrint }: { onPrint: () => void }) {
  const [routes, setRoutes] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/transport");
      setRoutes(await res.json());
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!routes) return;
    const rows: any[] = [];
    for (const route of routes) {
      for (const sr of route.studentRoutes) {
        rows.push({
          "Route": route.title,
          "Vehicle": route.vehicle?.vehicleNo ?? "",
          "Driver": route.vehicle?.driverName ?? "",
          "Admission No": sr.student.admissionNo,
          "Student": `${sr.student.firstName} ${sr.student.lastName}`,
          "Class": sr.student.sessions?.[0]?.classSection?.class?.name ?? "",
          "Section": sr.student.sessions?.[0]?.classSection?.section?.name ?? "",
          "Pickup Point": sr.pickupPoint?.name ?? "",
        });
      }
    }
    downloadCSV(rows, "transport-routes.csv");
  }

  const totalStudents = routes ? routes.reduce((s, r) => s + r.studentRoutes.length, 0) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Transport Route Report</h3>
        <div className="flex items-center gap-3">
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Load Routes"}
          </Button>
          {routes && <ReportActions onPrint={onPrint} onCSV={csv} count={totalStudents} />}
        </div>
      </div>

      {loading ? <LoadingState /> : routes === null ? <EmptyState /> : routes.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No routes configured.</div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{route.title}</p>
                  {route.vehicle && (
                    <p className="text-xs text-gray-500">
                      {route.vehicle.vehicleNo} · {route.vehicle.vehicleModel ?? ""} · Driver: {route.vehicle.driverName ?? "—"}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500">{route.studentRoutes.length} student{route.studentRoutes.length !== 1 ? "s" : ""}</span>
              </div>
              {route.studentRoutes.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">#</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Student</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Admission</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Class</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Pickup Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {route.studentRoutes.map((sr: any, i: number) => (
                      <tr key={sr.student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium">{sr.student.firstName} {sr.student.lastName}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{sr.student.admissionNo}</td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {sr.student.sessions?.[0]?.classSection?.class?.name ?? "—"}
                          {sr.student.sessions?.[0]?.classSection?.section?.name ? ` – ${sr.student.sessions[0].classSection.section.name}` : ""}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{sr.pickupPoint?.name ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 8. Library Issues Report ─────────────────────────────────────────────────

function LibraryReport({ onPrint }: { onPrint: () => void }) {
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (from && to) { params.set("from", from); params.set("to", to); }
      const res = await fetch(`/api/reports/library?${params}`);
      setRows(await res.json());
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  }

  function csv() {
    if (!rows) return;
    downloadCSV(rows.map((r) => ({
      "Book No": r.book.bookNo,
      "Title": r.book.title,
      "Author": r.book.author ?? "",
      "Borrower": r.student
        ? `${r.student.firstName} ${r.student.lastName}`
        : r.staff ? `${r.staff.firstName} ${r.staff.lastName}` : "",
      "Type": r.student ? "Student" : "Staff",
      "Issued": new Date(r.issuedAt).toLocaleDateString(),
      "Due": new Date(r.dueDate).toLocaleDateString(),
      "Returned": r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "",
      "Status": r.status,
      "Fine": r.fine ? `₵${r.fine}` : "",
    })), "library-issues.csv");
  }

  const overdue = rows ? rows.filter((r) => r.status === "ISSUED" && new Date(r.dueDate) < new Date()).length : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-sm mb-3">Library Issue Log</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Status</Label>
            <select className={SEL} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="ISSUED">Issued</option>
              <option value="RETURNED">Returned</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          <div>
            <Label>Issue Date From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>Issue Date To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button onClick={generate} disabled={loading} size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> {loading ? "Loading…" : "Generate"}
          </Button>
          {rows && <ReportActions onPrint={onPrint} onCSV={csv} count={rows.length} />}
        </div>
      </div>

      {loading ? <LoadingState /> : rows === null ? <EmptyState /> : rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No issue records found.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          {overdue > 0 && (
            <div className="px-4 py-2 bg-amber-50 border-b text-sm text-amber-700">
              {overdue} overdue book{overdue !== 1 ? "s" : ""} not yet returned
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Book</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Borrower</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Issued</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Due</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Returned</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => {
                  const overdueSingle = r.status === "ISSUED" && new Date(r.dueDate) < new Date();
                  const borrower = r.student
                    ? `${r.student.firstName} ${r.student.lastName}`
                    : r.staff ? `${r.staff.firstName} ${r.staff.lastName}` : "—";
                  return (
                    <tr key={r.id} className={`hover:bg-gray-50 ${overdueSingle ? "bg-amber-50" : ""}`}>
                      <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{r.book.title}</p>
                        <p className="text-xs text-gray-400">#{r.book.bookNo} · {r.book.author ?? ""}</p>
                      </td>
                      <td className="px-4 py-2.5">{borrower}</td>
                      <td className="px-4 py-2.5 text-gray-500">{r.student ? "Student" : "Staff"}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(r.issuedAt).toLocaleDateString()}</td>
                      <td className={`px-4 py-2.5 text-xs ${overdueSingle ? "text-red-600 font-medium" : "text-gray-500"}`}>
                        {new Date(r.dueDate).toLocaleDateString()}
                        {overdueSingle && " ⚠"}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">
                        {r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === "RETURNED" ? "bg-green-100 text-green-700"
                            : r.status === "LOST" ? "bg-red-100 text-red-700"
                            : overdueSingle ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {overdueSingle ? "Overdue" : r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-red-600">
                        {r.fine ? `₵${Number(r.fine).toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
