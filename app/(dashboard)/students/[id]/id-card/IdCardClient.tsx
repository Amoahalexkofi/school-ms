"use client";

import Link from "next/link";
import { ArrowLeft, Printer, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { student: any; school: any; template: any };

const FIELD_LABELS: Record<string, string> = {
  admissionNo: "Adm No.",
  rollNo:      "Roll No.",
  class:       "Class",
  dob:         "D.O.B",
  gender:      "Gender",
  bloodGroup:  "Blood Grp",
  fatherName:  "Father",
  phone:       "Phone",
  address:     "Address",
  houseNo:     "House",
  session:     "Session",
};

export function IdCardClient({ student, school, template }: Props) {
  const enroll  = student.sessions?.[0];
  const cls     = enroll?.classSection;
  const dob     = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-GB") : "—";

  // Use template colors if a template is set, fall back to defaults
  const bgColor   = template?.bgColor   ?? "#1a56db";
  const fontColor = template?.fontColor ?? "#ffffff";
  const bodyColor = template?.bodyColor ?? "#f9fafb";
  const heading   = template?.heading   ?? school?.name ?? "School Name";
  const title     = template?.title     ?? "Student Identity Card";

  // Fields to display (Smart School: configured per template)
  const fieldList: string[] = template?.fieldList ?? ["admissionNo", "class", "rollNo", "dob", "gender", "bloodGroup"];

  function fieldValue(key: string): string {
    switch (key) {
      case "admissionNo": return student.admissionNo ?? "—";
      case "rollNo":      return enroll?.rollNo ?? "—";
      case "class":       return cls ? `${cls.class.name} – ${cls.section.name}` : "—";
      case "dob":         return dob;
      case "gender":      return student.gender ?? "—";
      case "bloodGroup":  return student.bloodGroup ?? "—";
      case "fatherName":  return student.fatherName ?? "—";
      case "phone":       return student.mobileNo ?? "—";
      case "address":     return student.currentAddress ?? "—";
      case "houseNo":     return student.schoolHouse?.name ?? "—";
      case "session":     return enroll?.session?.session ?? "—";
      default:            return "—";
    }
  }

  return (
    <main className="min-h-screen bg-white/[0.04] p-6">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center justify-between mb-6 max-w-md mx-auto">
        <Link href={`/students/${student.id}`} className="flex items-center gap-1 text-sm text-white/40 hover:text-white/60">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="flex gap-2">
          <Link href="/students/id-card">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1.5" /> Templates
            </Button>
          </Link>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" /> Print
          </Button>
        </div>
      </div>

      {!template && (
        <div className="print:hidden max-w-md mx-auto mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-400">
          No active template found. <Link href="/students/id-card" className="underline font-medium">Create one →</Link>
        </div>
      )}

      {/* Card */}
      <div
        id="id-card"
        className="mx-auto bg-[#111318] rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
        style={{ width: 340, minHeight: 200 }}
      >
        {/* Header — uses template bgColor */}
        <div className="px-5 py-4 text-center" style={{ backgroundColor: bgColor, color: fontColor }}>
          <p className="font-bold text-base leading-tight">{heading}</p>
          {school?.address && <p className="text-xs mt-0.5 opacity-80">{school.address}</p>}
          <p className="text-xs mt-1 font-semibold tracking-widest opacity-90 uppercase">{title}</p>
        </div>

        {/* Body */}
        <div className="flex gap-4 px-5 py-4" style={{ backgroundColor: bodyColor }}>
          {/* Photo placeholder */}
          <div className="flex-shrink-0 w-20 h-24 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30">
            {student.photo
              ? <img src={student.photo} alt="" className="w-full h-full object-cover rounded-lg" />
              : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )
            }
          </div>

          {/* Details — only the fields configured in the template */}
          <div className="flex-1 space-y-1.5 text-sm">
            <p className="font-bold text-white/80 text-base leading-tight">
              {student.firstName} {student.middleName ? student.middleName + " " : ""}{student.lastName}
            </p>
            {fieldList.map(f => (
              <Row key={f} label={FIELD_LABELS[f] ?? f} value={fieldValue(f)} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-2 flex items-center justify-between" style={{ backgroundColor: bodyColor }}>
          <p className="text-xs text-white/30">Session: {enroll?.session?.session ?? "—"}</p>
          {student.schoolHouse && <p className="text-xs text-white/30">House: {student.schoolHouse.name}</p>}
        </div>

        <div className="px-5 py-3 text-center">
          <p className="text-xs text-white/30 italic">If found, please return to the school office</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #id-card, #id-card * { visibility: visible; }
          #id-card { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); }
        }
      `}</style>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-white/30 text-xs w-16 flex-shrink-0">{label}:</span>
      <span className="text-white/70 text-xs font-medium">{value}</span>
    </div>
  );
}
