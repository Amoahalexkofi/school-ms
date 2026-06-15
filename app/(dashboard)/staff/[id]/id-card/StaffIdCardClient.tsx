"use client";

import Link from "next/link";
import { ArrowLeft, Printer, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { staff: any; template: any };

export function StaffIdCardClient({ staff, template }: Props) {
  const headerColor = template?.headerColor ?? "#1a56db";
  const schoolName  = template?.schoolName  ?? "School Name";
  const schoolAddr  = template?.schoolAddress ?? "";
  const cardTitle   = template?.title       ?? "Staff Identity Card";
  const dob     = staff.dob          ? new Date(staff.dob).toLocaleDateString("en-GB")          : "—";
  const joined  = staff.dateOfJoining ? new Date(staff.dateOfJoining).toLocaleDateString("en-GB") : "—";

  type Row = { label: string; value: string };
  const rows: Row[] = [];

  if (template?.enableName ?? true)
    rows.push({ label: "Name", value: `${staff.firstName} ${staff.lastName}` });
  if (template?.enableStaffId ?? true)
    rows.push({ label: "Staff ID", value: staff.employeeId ?? "—" });
  if (template?.enableStaffRole ?? true)
    rows.push({ label: "Role", value: staff.user?.role?.replace(/_/g, " ") ?? "—" });
  if (template?.enableStaffDepartment ?? true)
    rows.push({ label: "Department", value: staff.department?.name ?? "—" });
  if (template?.enableDesignation ?? true)
    rows.push({ label: "Designation", value: staff.designation?.name ?? "—" });
  if (template?.enableStaffPhone ?? true)
    rows.push({ label: "Phone", value: staff.contactNo ?? "—" });
  if (template?.enableDateOfJoining)
    rows.push({ label: "Joined", value: joined });
  if (template?.enableStaffDob)
    rows.push({ label: "D.O.B", value: dob });
  if (template?.enableFathersName)
    rows.push({ label: "Father", value: staff.fatherName ?? "—" });
  if (template?.enableMothersName)
    rows.push({ label: "Mother", value: staff.motherName ?? "—" });
  if (template?.enablePermanentAddress)
    rows.push({ label: "Address", value: staff.permanentAddress ?? "—" });

  return (
    <main className="min-h-screen bg-white/[0.04] p-6">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center justify-between mb-6 max-w-md mx-auto">
        <Link href={`/staff/${staff.id}`} className="flex items-center gap-1 text-sm text-white/40 hover:text-white/60">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="flex gap-2">
          <Link href="/staff/id-card">
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
          No template found. <Link href="/staff/id-card" className="underline font-medium">Create one →</Link>
        </div>
      )}

      {/* Card */}
      <div
        id="id-card"
        className="mx-auto bg-[#111318] rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
        style={{ width: 340, minHeight: 200 }}
      >
        {/* Header */}
        <div className="px-5 py-4 text-center text-white" style={{ backgroundColor: headerColor }}>
          <p className="font-bold text-base leading-tight">{schoolName}</p>
          {schoolAddr && <p className="text-xs mt-0.5 opacity-80">{schoolAddr}</p>}
          <p className="text-xs mt-1 font-semibold tracking-widest opacity-90 uppercase">{cardTitle}</p>
        </div>

        {/* Body */}
        <div className="flex gap-4 px-5 py-4 bg-[#0f1015]">
          {/* Photo */}
          <div className="flex-shrink-0 w-20 h-24 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30">
            {staff.photo
              ? <img src={staff.photo} alt="" className="w-full h-full object-cover rounded-lg" />
              : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )
            }
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-1.5 text-sm">
            <p className="font-bold text-white/80 text-base leading-tight">
              {staff.firstName} {staff.lastName}
            </p>
            {rows.filter(r => r.label !== "Name").map(r => (
              <div key={r.label} className="flex gap-1.5">
                <span className="text-white/30 text-xs w-20 flex-shrink-0">{r.label}:</span>
                <span className="text-white/70 text-xs font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-2 bg-[#0f1015] flex items-center justify-between">
          <p className="text-xs text-white/30">{staff.employeeId}</p>
          {staff.department?.name && (
            <p className="text-xs text-white/30">{staff.department.name}</p>
          )}
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
