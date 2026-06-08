"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { student: any; school: any };

export function IdCardClient({ student, school }: Props) {
  const enroll = student.sessions?.[0];
  const cls    = enroll?.classSection;
  const dob    = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString("en-GB")
    : "—";

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center justify-between mb-6 max-w-md mx-auto">
        <Link href={`/students/${student.id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1.5" /> Print ID Card
        </Button>
      </div>

      {/* Card */}
      <div
        id="id-card"
        className="mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
        style={{ width: 340, minHeight: 200 }}
      >
        {/* Header */}
        <div className="bg-blue-700 text-white px-5 py-4 text-center">
          <p className="font-bold text-base leading-tight">{school?.name ?? "School Name"}</p>
          {school?.address && <p className="text-xs mt-0.5 opacity-80">{school.address}</p>}
          <p className="text-xs mt-1 font-semibold tracking-widest opacity-90 uppercase">Student Identity Card</p>
        </div>

        {/* Body */}
        <div className="flex gap-4 px-5 py-4">
          {/* Photo placeholder */}
          <div className="flex-shrink-0 w-20 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-1.5 text-sm">
            <p className="font-bold text-gray-900 text-base leading-tight">
              {student.firstName} {student.middleName ? student.middleName + " " : ""}{student.lastName}
            </p>
            <Row label="Adm No."  value={student.admissionNo ?? "—"} />
            <Row label="Class"    value={cls ? `${cls.class.name} – ${cls.section.name}` : "—"} />
            <Row label="Roll No." value={enroll?.rollNo ?? "—"} />
            <Row label="D.O.B"   value={dob} />
            {student.bloodGroup && <Row label="Blood Grp" value={student.bloodGroup} />}
            {student.gender && <Row label="Gender" value={student.gender} />}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-5 py-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Session: {enroll?.session?.session ?? "—"}
          </p>
          {student.schoolHouse && (
            <p className="text-xs text-gray-400">House: {student.schoolHouse.name}</p>
          )}
        </div>

        <div className="px-5 py-3 text-center">
          <p className="text-xs text-gray-300 italic">If found, please return to the school office</p>
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
      <span className="text-gray-400 text-xs w-16 flex-shrink-0">{label}:</span>
      <span className="text-gray-800 text-xs font-medium">{value}</span>
    </div>
  );
}
