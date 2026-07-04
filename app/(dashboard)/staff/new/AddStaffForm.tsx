"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { departments: any[]; designations: any[] };

const GENDERS   = ["Male", "Female", "Other"];
const RELIGIONS = ["Christian", "Muslim", "Traditional", "Other"];
const MARITAL   = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
const CONTRACTS = ["PERMANENT", "CONTRACT", "TEMPORARY"];
const ROLES     = ["TEACHER", "ADMIN", "ACCOUNTANT", "LIBRARIAN", "SUPER_ADMIN"];

const SECTIONS = ["Personal Info", "Employment", "Contact & Address", "Financial", "Social & Notes"] as const;
type Section = typeof SECTIONS[number];

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">{children}</div>;
}

function Field({
  label, name, type = "text", value, onChange, options, span, rows, hint,
}: {
  label: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  options?: string[] | { value: string; label: string }[];
  span?: "2" | "3"; rows?: number; hint?: string;
}) {
  const base = "mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-400";
  const spanCls = span === "3" ? "sm:col-span-2 lg:col-span-3" : span === "2" ? "sm:col-span-2" : "";
  return (
    <div className={spanCls}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      {options ? (
        <select className={base} value={value} onChange={onChange}>
          <option value="">— Select —</option>
          {options.map(o =>
            typeof o === "string"
              ? <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
      ) : rows ? (
        <textarea rows={rows} className={base + " resize-none"} value={value} onChange={onChange} />
      ) : (
        <input type={type} className={base} value={value} onChange={onChange} />
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-2 mb-5">
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
    </div>
  );
}

const empty = {
  firstName: "", lastName: "", fatherName: "", motherName: "",
  dob: "", gender: "", maritalStatus: "", religion: "", qualification: "", workExperience: "",
  employeeId: "", role: "TEACHER", departmentId: "", designationId: "",
  dateOfJoining: "", contractType: "", payscale: "", shift: "", location: "",
  email: "", contactNo: "", emergencyContact: "",
  localAddress: "", permanentAddress: "", city: "", state: "", country: "",
  basicSalary: "", bankAccountNo: "", bankName: "", ifscCode: "", bankBranch: "", epfNo: "",
  facebook: "", twitter: "", linkedin: "", instagram: "", note: "",
};

export function AddStaffForm({ departments, designations }: Props) {
  const router = useRouter();
  const [form, setForm]       = useState(empty);
  const [section, setSection] = useState<Section>("Personal Info");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [created, setCreated] = useState<{ name: string; tempPassword: string } | null>(null);

  const set = (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const deptOpts  = departments.map((d: any)  => ({ value: d.id, label: d.name }));
  const desigOpts = designations.map((d: any) => ({ value: d.id, label: d.name }));
  const secIdx    = SECTIONS.indexOf(section);

  async function handleSave() {
    if (!form.firstName || !form.lastName || !form.gender) {
      setError("First name, last name, and gender are required.");
      setSection("Personal Info");
      return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCreated({ name: `${form.firstName} ${form.lastName}`.trim(), tempPassword: data.tempPassword ?? "" });
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  }

  if (created) {
    return (
      <main className="flex-1 bg-gray-50 min-h-0">
        <div className="max-w-md mx-auto mt-10 bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-3">
            <span className="text-emerald-600 text-2xl leading-none">✓</span>
          </div>
          <h1 className="text-[18px] font-semibold text-slate-900">Staff member created</h1>
          <p className="text-[13px] text-slate-500 mt-1">{created.name} has been added.</p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-5 text-left">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Temporary password</p>
            <p className="text-[18px] font-bold text-slate-900 font-mono mt-1 select-all">{created.tempPassword || "—"}</p>
            <p className="text-[12px] text-slate-500 mt-2">Share this with the staff member to log in. They can change it anytime via “Forgot password”.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setCreated(null); window.location.reload(); }}
              className="flex-1 h-10 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Add another
            </button>
            <Link href="/staff"
              className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium flex items-center justify-center transition-colors">
              Go to Staff
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50 min-h-0">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Back */}
        <Link href="/staff" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Staff
        </Link>

        {/* Step nav */}
        <div className="flex items-center gap-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {SECTIONS.map((s, i) => {
            const done   = i < secIdx;
            const active = s === section;
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium border-r last:border-r-0 transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : done
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                  active ? "bg-white/20" : done ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-500"
                }`}>
                  {done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : i + 1}
                </span>
                <span className="hidden sm:block text-center leading-tight">{s}</span>
              </button>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">

          {/* ── Personal Info ── */}
          {section === "Personal Info" && <>
            <SectionHeading>Basic Information</SectionHeading>
            <Row>
              <Field label="First Name *" name="firstName" value={form.firstName} onChange={set("firstName")} />
              <Field label="Last Name *"  name="lastName"  value={form.lastName}  onChange={set("lastName")} />
              <Field label="Date of Birth" name="dob" type="date" value={form.dob} onChange={set("dob")} />
              <Field label="Gender *" name="gender" value={form.gender} onChange={set("gender")} options={GENDERS} />
              <Field label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={set("maritalStatus")} options={MARITAL} />
              <Field label="Religion" name="religion" value={form.religion} onChange={set("religion")} options={RELIGIONS} />
              <Field label="Father's Name" name="fatherName" value={form.fatherName} onChange={set("fatherName")} />
              <Field label="Mother's Name" name="motherName" value={form.motherName} onChange={set("motherName")} />
            </Row>
            <SectionHeading>Education &amp; Experience</SectionHeading>
            <Row>
              <Field label="Qualification" name="qualification" value={form.qualification} onChange={set("qualification")} />
              <Field label="Work Experience" name="workExperience" value={form.workExperience} onChange={set("workExperience")} hint="e.g. 5 years" />
            </Row>
          </>}

          {/* ── Employment ── */}
          {section === "Employment" && <>
            <SectionHeading>Role &amp; Identity</SectionHeading>
            <Row>
              <Field label="Employee ID" name="employeeId" value={form.employeeId} onChange={set("employeeId")} hint="Auto-generated if left blank" />
              <Field label="Role" name="role" value={form.role} onChange={set("role")} options={ROLES} />
              <Field label="Department" name="departmentId" value={form.departmentId} onChange={set("departmentId")} options={deptOpts} />
              <Field label="Designation" name="designationId" value={form.designationId} onChange={set("designationId")} options={desigOpts} />
            </Row>
            <SectionHeading>Contract &amp; Schedule</SectionHeading>
            <Row>
              <Field label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={set("dateOfJoining")} />
              <Field label="Contract Type" name="contractType" value={form.contractType} onChange={set("contractType")} options={CONTRACTS} />
              <Field label="Payscale" name="payscale" value={form.payscale} onChange={set("payscale")} />
              <Field label="Shift" name="shift" value={form.shift} onChange={set("shift")} hint="e.g. Morning, Afternoon" />
              <Field label="Location / Branch" name="location" value={form.location} onChange={set("location")} />
            </Row>
          </>}

          {/* ── Contact & Address ── */}
          {section === "Contact & Address" && <>
            <SectionHeading>Contact Details</SectionHeading>
            <Row>
              <Field label="Email Address" name="email" type="email" value={form.email} onChange={set("email")} />
              <Field label="Mobile / Contact No." name="contactNo" value={form.contactNo} onChange={set("contactNo")} />
              <Field label="Emergency Contact" name="emergencyContact" value={form.emergencyContact} onChange={set("emergencyContact")} />
            </Row>
            <SectionHeading>Address</SectionHeading>
            <Row>
              <Field label="Local Address" name="localAddress" value={form.localAddress} onChange={set("localAddress")} rows={3} span="3" />
              <Field label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={set("permanentAddress")} rows={3} span="3" />
              <Field label="City" name="city" value={form.city} onChange={set("city")} />
              <Field label="State / Region" name="state" value={form.state} onChange={set("state")} />
              <Field label="Country" name="country" value={form.country} onChange={set("country")} />
            </Row>
          </>}

          {/* ── Financial ── */}
          {section === "Financial" && <>
            <SectionHeading>Salary</SectionHeading>
            <Row>
              <Field label="Basic Salary (₵)" name="basicSalary" type="number" value={form.basicSalary} onChange={set("basicSalary")} />
              <Field label="EPF / Pension No." name="epfNo" value={form.epfNo} onChange={set("epfNo")} />
            </Row>
            <SectionHeading>Bank Details</SectionHeading>
            <Row>
              <Field label="Bank Name" name="bankName" value={form.bankName} onChange={set("bankName")} />
              <Field label="Account Number" name="bankAccountNo" value={form.bankAccountNo} onChange={set("bankAccountNo")} />
              <Field label="IFSC / Sort Code" name="ifscCode" value={form.ifscCode} onChange={set("ifscCode")} />
              <Field label="Bank Branch" name="bankBranch" value={form.bankBranch} onChange={set("bankBranch")} />
            </Row>
          </>}

          {/* ── Social & Notes ── */}
          {section === "Social & Notes" && <>
            <SectionHeading>Social Media</SectionHeading>
            <Row>
              <Field label="Facebook" name="facebook" value={form.facebook} onChange={set("facebook")} />
              <Field label="Twitter / X" name="twitter" value={form.twitter} onChange={set("twitter")} />
              <Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={set("linkedin")} />
              <Field label="Instagram" name="instagram" value={form.instagram} onChange={set("instagram")} />
            </Row>
            <SectionHeading>Notes</SectionHeading>
            <Field label="Note" name="note" value={form.note} onChange={set("note")} rows={4} span="3" />
          </>}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pb-8">
          <div>
            {secIdx > 0 && (
              <Button variant="outline" onClick={() => setSection(SECTIONS[secIdx - 1])}>
                ← Previous
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {secIdx < SECTIONS.length - 1 ? (
              <>
                <Button variant="outline" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving…" : "Save &amp; Exit"}
                </Button>
                <Button onClick={() => setSection(SECTIONS[secIdx + 1])}>
                  Next →
                </Button>
              </>
            ) : (
              <>
                <Link href="/staff"><Button variant="outline">Cancel</Button></Link>
                <Button disabled={saving} onClick={handleSave} className="min-w-[160px]">
                  {saving ? "Saving…" : "Add Staff Member"}
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
