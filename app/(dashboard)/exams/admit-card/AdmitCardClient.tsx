"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, FileText } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

type Schedule = {
  id: string; dateOfExam: string | null; startTime: string | null; endTime: string | null;
  roomNo: string | null; fullMarks: number; passingMarks: number;
  subject: { name: string };
  session: { id: string; session: string };
};

type ExamGroup = { id: string; name: string; schedules: Schedule[] };
type ClassData = { id: string; name: string; classSections: { id: string; section: { id: string; name: string } }[] };
type Student = {
  id: string; firstName: string; lastName: string; admissionNo: string;
  rollNo?: string; dob?: string; gender?: string; fatherName?: string;
  motherName?: string; currentAddress?: string; image?: string;
};

export function AdmitCardClient({ examGroups, classes, school }: {
  examGroups: ExamGroup[];
  classes: ClassData[];
  school: { name: string; address?: string; phone?: string; logo?: string } | null;
}) {
  const [examGroupId, setExamGroupId] = useState("");
  const [classId, setClassId] = useState("");
  const [classSectionId, setClassSectionId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedExam = examGroups.find(e => e.id === examGroupId);
  const selectedClass = classes.find(c => c.id === classId);
  const sections = selectedClass?.classSections ?? [];

  // Get the sessionId from exam schedules (all schedules in a group share the same session)
  const sessionId = selectedExam?.schedules?.[0]?.session?.id ?? null;

  async function loadStudents() {
    if (!classSectionId || !sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/students?classSectionId=${classSectionId}&sessionId=${sessionId}&limit=200`);
      const data = await res.json();
      setStudents(Array.isArray(data.students) ? data.students : Array.isArray(data) ? data : []);
    } catch { setStudents([]); }
    finally { setLoading(false); }
  }

  const schedules = selectedExam?.schedules ?? [];
  const schoolName = school?.name ?? "Skula";

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Filter panel — no-print */}
      <div className="no-print">
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label className="text-xs mb-1 block">Exam Group *</Label>
                <select className={SEL + " w-52"} value={examGroupId} onChange={e => { setExamGroupId(e.target.value); setStudents([]); }}>
                  <option value="">Select Exam Group</option>
                  {examGroups.map(eg => <option key={eg.id} value={eg.id}>{eg.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Class *</Label>
                <select className={SEL + " w-40"} value={classId} onChange={e => { setClassId(e.target.value); setClassSectionId(""); setStudents([]); }}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Section *</Label>
                <select className={SEL + " w-36"} value={classSectionId} onChange={e => { setClassSectionId(e.target.value); setStudents([]); }} disabled={!classId}>
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.section.name}</option>)}
                </select>
              </div>
              <Button onClick={loadStudents} disabled={!examGroupId || !classSectionId || loading}>
                {loading ? "Loading…" : "Generate Admit Cards"}
              </Button>
              {students.length > 0 && (
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-1" /> Print All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {students.length === 0 && !loading && (
        <div className="no-print text-center py-16 text-white/30 border-2 border-dashed rounded-xl">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select an exam group, class and section then click Generate</p>
        </div>
      )}

      {/* Admit Cards — print layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
        {students.map(student => (
          <div
            key={student.id}
            className="border-2 border-gray-800 rounded-lg overflow-hidden print:break-inside-avoid print:border print:rounded-none"
          >
            {/* Header */}
            <div className="bg-blue-700 text-white p-3 text-center">
              <h2 className="font-bold text-lg leading-tight">{schoolName}</h2>
              {school?.address && <p className="text-xs text-blue-200 mt-0.5">{school.address}</p>}
              <div className="mt-2 bg-[#111318] text-blue-400 rounded px-3 py-0.5 inline-block">
                <p className="font-bold text-sm tracking-wide">ADMIT CARD</p>
              </div>
              <p className="text-xs text-blue-200 mt-1 font-medium">{selectedExam?.name}</p>
            </div>

            {/* Student Info */}
            <div className="p-3 flex gap-3">
              <div className="w-16 h-20 bg-white/[0.04] border border-white/[0.08] rounded flex items-center justify-center shrink-0 overflow-hidden">
                {student.image
                  ? <img src={student.image} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl text-white/30 font-bold">{student.firstName[0]}</span>
                }
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                <InfoRow label="Name" value={`${student.firstName} ${student.lastName}`} />
                <InfoRow label="Admission No" value={student.admissionNo} />
                <InfoRow label="Roll No" value={student.rollNo ?? "—"} />
                <InfoRow label="Class" value={`${selectedClass?.name} / ${sections.find(s => s.id === classSectionId)?.section.name}`} />
                <InfoRow label="Father's Name" value={student.fatherName ?? "—"} />
                <InfoRow label="Mother's Name" value={student.motherName ?? "—"} />
                <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString() : "—"} />
                <InfoRow label="Gender" value={student.gender ?? "—"} />
              </div>
            </div>

            {/* Exam Schedule Table */}
            <div className="px-3 pb-3">
              <p className="text-xs font-semibold text-white/50 mb-1 border-b pb-1">Examination Schedule</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0f1015]">
                    <th className="text-left py-1 px-1.5 font-semibold text-white/50">Subject</th>
                    <th className="text-left py-1 px-1.5 font-semibold text-white/50">Date</th>
                    <th className="text-left py-1 px-1.5 font-semibold text-white/50">Time</th>
                    <th className="text-right py-1 px-1.5 font-semibold text-white/50">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 ? (
                    <tr><td colSpan={4} className="py-1 px-1.5 text-white/30 italic">No schedule defined</td></tr>
                  ) : schedules.map(s => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-0.5 px-1.5">{s.subject.name}</td>
                      <td className="py-0.5 px-1.5">{s.dateOfExam ? new Date(s.dateOfExam).toLocaleDateString() : "TBD"}</td>
                      <td className="py-0.5 px-1.5">{s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : "TBD"}</td>
                      <td className="py-0.5 px-1.5 text-right">{s.fullMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t px-3 py-2 flex justify-between items-center text-xs text-white/40">
              <p>{selectedExam?.schedules?.[0]?.session?.session}</p>
              <div className="text-right">
                <div className="border-t border-gray-400 mt-4 pt-0.5 w-24">Principal's Signature</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-white/30">{label}: </span>
      <span className="font-medium text-white/70">{value}</span>
    </div>
  );
}
