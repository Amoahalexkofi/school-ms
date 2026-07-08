"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ChevronRight, AlertCircle, UserPlus } from "lucide-react";

// Shared select class — matches Input h-11 rounded-xl
const SEL = "w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 hover:border-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15 transition-all cursor-pointer";

const TABS = ["Basic Info", "Guardian", "Address", "Academic", "Other"] as const;
type Tab = typeof TABS[number];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS      = ["Male", "Female", "Other"];
const RELIGIONS    = ["Christian", "Muslim", "Traditional", "Other"];
const GUARDIAN_IS  = ["Father", "Mother", "Guardian", "Other"];

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  options?: string[] | { value: string; label: string }[];
  textarea?: boolean;
  colSpan2?: boolean;
  hint?: string;
  form: Record<string, any>;
  set: (k: string) => (e: React.ChangeEvent<any>) => void;
};

function Field({ label, name, required, type = "text", options, textarea, colSpan2, hint, form, set }: FieldProps) {
  return (
    <div className={colSpan2 ? "col-span-2" : ""}>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {options ? (
        <select className={SEL} value={form[name]} onChange={set(name)}>
          <option value="">— Select —</option>
          {options.map((o) =>
            typeof o === "string"
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
      ) : textarea ? (
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 hover:border-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15 transition-all resize-none placeholder:text-slate-400"
          value={form[name]}
          onChange={set(name)}
        />
      ) : (
        <Input type={type} value={form[name]} onChange={set(name)} />
      )}
      {hint && <p className="text-[11.5px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

type Props = {
  sessions: any[];
  classSections: any[];
  schoolHouses: any[];
  initial?: Record<string, any>;
  applicationId?: string;
  fromApplication?: { name: string; appliedClass: string };
};

function DeliveryRow({ label, state }: { label: string; state: { ok: boolean; error?: string; skipped?: boolean; via?: string } }) {
  const notConfigured = state.error === "SMTP not configured" || (state.error ?? "").includes("No active WhatsApp");
  // WhatsApp "success" on a freeform text only means Meta ACCEPTED it — it is
  // silently dropped unless the parent messaged the school's number in the
  // last 24h. Only a template send is reliably delivered, so say so.
  const acceptedOnly = state.ok && state.via === "freeform";
  const text = state.ok
    ? acceptedOnly ? "Accepted — delivery not guaranteed" : "Sent"
    : state.skipped
      ? "Not attempted"
      : notConfigured
        ? "Channel not configured"
        : `Failed${state.error ? ` — ${state.error}` : ""}`;
  const cls = state.ok
    ? acceptedOnly ? "text-amber-600" : "text-emerald-600"
    : state.skipped || notConfigured ? "text-slate-400" : "text-rose-600";
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center justify-between text-[12.5px] w-full">
        <span className="text-slate-600">{label}</span>
        <span className={`font-medium ${cls}`}>{state.ok && !acceptedOnly ? "✓ " : ""}{text}</span>
      </div>
      {acceptedOnly && (
        <p className="text-[11px] text-amber-700/80 text-right mt-0.5 max-w-[300px]">
          WhatsApp only delivers cold messages via an approved template — it reaches the parent
          only if they&apos;ve messaged the school&apos;s WhatsApp in the last 24 hours.
        </p>
      )}
    </div>
  );
}

export function AddStudentForm({ sessions, classSections, schoolHouses, initial, applicationId, fromApplication }: Props) {
  const router = useRouter();
  const [tab, setTab]       = useState<Tab>("Basic Info");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [created, setCreated] = useState<{
    name: string;
    tempPassword: string;
    parent?: { email: string; tempPassword: string | null; existing: boolean; conflict: boolean } | null;
    delivery?: { email: { ok: boolean; error?: string; skipped?: boolean }; whatsapp: { ok: boolean; error?: string; skipped?: boolean } } | null;
  } | null>(null);

  const [form, setForm] = useState({
    firstName: "", middleName: "", lastName: "", admissionNo: "",
    admissionDate: "", dateOfBirth: "", gender: "", bloodGroup: "",
    religion: "", nationality: "",
    mobileNo: "", email: "", rte: false, height: "", weight: "",
    guardianIs: "Father",
    fatherName: "", fatherPhone: "", fatherEmail: "", fatherOccupation: "",
    motherName: "", motherPhone: "", motherEmail: "", motherOccupation: "",
    guardianName: "", guardianRelation: "", guardianPhone: "",
    guardianEmail: "", guardianOccupation: "", guardianAddress: "",
    parentEmail: "", parentPhone: "",
    currentAddress: "", permanentAddress: "", city: "", state: "", country: "", pincode: "",
    sessionId: sessions[0]?.id ?? "",
    classSectionId: classSections[0]?.id ?? "",
    rollNo: "", schoolHouseId: "",
    previousSchool: "", previousClass: "", previousPercent: "", previousTc: "",
    bankAccountNo: "", bankName: "", ifscCode: "", bankBranch: "",
    aadharNo: "", samagraId: "", note: "", about: "",
    ...(initial ?? {}),
  });

  const set = (k: string) =>
    (e: React.ChangeEvent<any>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const fp = { form: form as Record<string, any>, set };
  const tabIdx = TABS.indexOf(tab);

  // Per-step validation — the stepper only advances past a valid step, so a
  // student can't be created from Basic Info alone.
  function validateStep(t: string): string | null {
    switch (t) {
      case "Basic Info":
        if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender)
          return "First name, last name, date of birth and gender are required.";
        return null;
      case "Guardian":
        if (!form.parentEmail.trim() && !form.parentPhone.trim())
          return "Enter the parent's WhatsApp number and/or email (Parent Portal Login) — the login details are sent there.";
        return null;
      case "Academic":
        if (!form.sessionId || !form.classSectionId)
          return "Select the session and class/section for enrollment.";
        return null;
      default:
        return null;
    }
  }

  // Forward navigation validates every step being skipped over; going back is free.
  function goToTab(target: string) {
    const targetIdx = TABS.indexOf(target as typeof TABS[number]);
    if (targetIdx <= tabIdx) { setError(""); setTab(target as typeof TABS[number]); return; }
    for (let i = tabIdx; i < targetIdx; i++) {
      const err = validateStep(TABS[i]);
      if (err) { setTab(TABS[i]); setError(err); return; }
    }
    setError("");
    setTab(target as typeof TABS[number]);
  }

  async function handleSubmit() {
    for (const t of TABS) {
      const err = validateStep(t);
      if (err) { setTab(t); setError(err); return; }
    }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCreated({ name: `${form.firstName} ${form.lastName}`.trim(), tempPassword: data.tempPassword ?? "", parent: data.parent ?? null, delivery: data.delivery ?? null });
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <main className="flex-1 p-5 md:p-7">
        <div className="max-w-md mx-auto mt-10 bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-3">
            <span className="text-emerald-600 text-2xl leading-none">✓</span>
          </div>
          <h1 className="text-[18px] font-semibold text-slate-900">Student created</h1>
          <p className="text-[13px] text-slate-500 mt-1">{created.name} has been added.</p>

          <div className="my-5 space-y-3 text-left">
            {/* Student credential */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student temp password</p>
              <p className="text-[18px] font-bold text-slate-900 font-mono mt-1 select-all">{created.tempPassword || "—"}</p>
            </div>

            {/* Parent credential */}
            {created.parent && !created.parent.conflict && (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Parent login · {created.parent.email}</p>
                {created.parent.existing ? (
                  <p className="text-[13px] text-slate-600 mt-1">Linked to their existing parent account — siblings share one login.</p>
                ) : (
                  <p className="text-[18px] font-bold text-slate-900 font-mono mt-1 select-all">{created.parent.tempPassword || "—"}</p>
                )}
              </div>
            )}

            {/* Non-parent email conflict */}
            {created.parent?.conflict && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[12.5px] text-amber-800">
                That parent email already belongs to a non-parent account, so no parent login was linked.
              </div>
            )}

            {/* Delivery status — shown whenever a send was attempted (email
                and/or WhatsApp), so a failed or unconfigured channel is
                visible instead of silently implied. */}
            {created.delivery && (
              <div className="border border-slate-200 rounded-lg p-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Login details sent to parent</p>
                <DeliveryRow label="Email" state={created.delivery.email} />
                <DeliveryRow label="WhatsApp" state={created.delivery.whatsapp} />
              </div>
            )}
            {!created.delivery && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[12.5px] text-amber-800">
                No parent contact was provided, so no login details were sent — share the passwords above yourself.
              </div>
            )}

            <p className="text-[12px] text-slate-500">
              Everyone is prompted to set a new password on first sign-in. Share these as a fallback if the messages don't arrive.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setCreated(null); window.location.reload(); }}
              className="flex-1 h-10 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Add another
            </button>
            <Link href="/students"
              className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium flex items-center justify-center transition-colors">
              Go to Students
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-5 md:p-7">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Back link */}
        <Link href="/students"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
        </Link>

        {/* Page header */}
        <div>
          <h1 className="text-[22px] font-black text-slate-900 tracking-tight">Add New Student</h1>
          <p className="text-[13.5px] text-slate-500 mt-0.5">Fill in the details below. Required fields are marked.</p>
        </div>

        {/* Enrolling from an approved online application */}
        {fromApplication && (
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
            <UserPlus className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[13px] text-slate-700">
              Enrolling <span className="font-semibold text-slate-900">{fromApplication.name}</span> from an online admission application — details below are pre-filled. Set the class &amp; section, then create.
              {fromApplication.appliedClass && (
                <span className="block text-[12px] text-indigo-700/80 mt-0.5">
                  Class applied for: <span className="font-semibold text-indigo-900">{fromApplication.appliedClass}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab nav — pill style */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => goToTab(t)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-150 whitespace-nowrap ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                tab === t ? "bg-indigo-600 text-white" : "bg-slate-300/60 text-slate-500"
              }`}>{i + 1}</span>
              {t}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Basic Info ── */}
        {tab === "Basic Info" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900 tracking-tight">Basic Information</h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Personal and identification details</p>
            </div>
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field {...fp} label="First Name" name="firstName" required />
              <Field {...fp} label="Middle Name" name="middleName" />
              <Field {...fp} label="Last Name" name="lastName" required />
              <Field {...fp} label="Admission No." name="admissionNo" hint="Leave blank to auto-generate" />
              <Field {...fp} label="Admission Date" name="admissionDate" type="date" />
              <Field {...fp} label="Date of Birth" name="dateOfBirth" type="date" required />
              <Field {...fp} label="Gender" name="gender" options={GENDERS} required />
              <Field {...fp} label="Blood Group" name="bloodGroup" options={BLOOD_GROUPS} />
              <Field {...fp} label="Religion" name="religion" options={RELIGIONS} />
              <Field {...fp} label="Nationality" name="nationality" />
              <Field {...fp} label="Mobile No." name="mobileNo" />
              <Field {...fp} label="Email Address" name="email" type="email" />
              <div /> {/* spacer */}
              <Field {...fp} label="Height (cm)" name="height" />
              <Field {...fp} label="Weight (kg)" name="weight" />
              <div className="col-span-2">
                <label className="flex items-center gap-3 cursor-pointer select-none group w-fit">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="rte"
                      checked={form.rte as boolean}
                      onChange={e => setForm(f => ({ ...f, rte: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 rounded-full bg-slate-200 peer-checked:bg-indigo-600 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-[13.5px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    RTE (Right to Education) student
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Guardian ── */}
        {tab === "Guardian" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900 tracking-tight">Guardian Information</h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Parent and emergency contact details</p>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Field {...fp} label="Guardian Is" name="guardianIs" options={GUARDIAN_IS} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Father</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field {...fp} label="Father's Name" name="fatherName" />
                  <Field {...fp} label="Father's Phone" name="fatherPhone" />
                  <Field {...fp} label="Father's Email" name="fatherEmail" type="email" />
                  <Field {...fp} label="Father's Occupation" name="fatherOccupation" />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Mother</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field {...fp} label="Mother's Name" name="motherName" />
                  <Field {...fp} label="Mother's Phone" name="motherPhone" />
                  <Field {...fp} label="Mother's Email" name="motherEmail" type="email" />
                  <Field {...fp} label="Mother's Occupation" name="motherOccupation" />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Guardian / Other</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field {...fp} label="Guardian Name" name="guardianName" />
                  <Field {...fp} label="Relationship" name="guardianRelation" />
                  <Field {...fp} label="Phone" name="guardianPhone" />
                  <Field {...fp} label="Email" name="guardianEmail" type="email" />
                  <Field {...fp} label="Occupation" name="guardianOccupation" />
                  <div />
                  <Field {...fp} label="Guardian Address" name="guardianAddress" textarea colSpan2 />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Parent Portal Login</p>
                <p className="text-[12.5px] text-slate-500 mb-4">
                  Optional. If provided, a parent account is created (or a sibling linked) and login details are sent by email &amp; WhatsApp.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field {...fp} label="Parent Email (login)" name="parentEmail" type="email" hint="Used as the parent's username" />
                  <Field {...fp} label="Parent WhatsApp Number" name="parentPhone" hint="Include country code, e.g. +233…" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Address ── */}
        {tab === "Address" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900 tracking-tight">Address Details</h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Current and permanent residential address</p>
            </div>
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field {...fp} label="Current Address" name="currentAddress" textarea colSpan2 />
              <Field {...fp} label="Permanent Address" name="permanentAddress" textarea colSpan2 />
              <Field {...fp} label="City" name="city" />
              <Field {...fp} label="State / Region" name="state" />
              <Field {...fp} label="Country" name="country" />
              <Field {...fp} label="Postcode / Pincode" name="pincode" />
            </div>
          </div>
        )}

        {/* ── Academic ── */}
        {tab === "Academic" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900 tracking-tight">Academic Details</h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Session, class and previous school information</p>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Session</label>
                  <select className={SEL} value={form.sessionId} onChange={set("sessionId")}>
                    <option value="">— None —</option>
                    {sessions.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.session ?? s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Class / Section</label>
                  <select className={SEL} value={form.classSectionId} onChange={set("classSectionId")}>
                    <option value="">— None —</option>
                    {classSections.map((cs: any) => (
                      <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                    ))}
                  </select>
                </div>
                <Field {...fp} label="Roll No." name="rollNo" />
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">School House</label>
                  <select className={SEL} value={form.schoolHouseId} onChange={set("schoolHouseId")}>
                    <option value="">— None —</option>
                    {schoolHouses.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Previous School</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field {...fp} label="School Name" name="previousSchool" />
                  <Field {...fp} label="Class" name="previousClass" />
                  <Field {...fp} label="Percentage (%)" name="previousPercent" />
                  <Field {...fp} label="TC Number" name="previousTc" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Other ── */}
        {tab === "Other" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900 tracking-tight">Other Details</h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Banking, identification and additional notes</p>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bank Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field {...fp} label="Account Number" name="bankAccountNo" />
                  <Field {...fp} label="Bank Name" name="bankName" />
                  <Field {...fp} label="IFSC / Sort Code" name="ifscCode" />
                  <Field {...fp} label="Branch" name="bankBranch" />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Identification</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field {...fp} label="National ID / Aadhar" name="aadharNo" />
                  <Field {...fp} label="Samagra ID" name="samagraId" />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <div className="grid grid-cols-1 gap-y-5">
                  <Field {...fp} label="Note" name="note" textarea />
                  <Field {...fp} label="About" name="about" textarea />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-2">
            {tabIdx > 0 && (
              <Button variant="outline" type="button" onClick={() => setTab(TABS[tabIdx - 1])}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            )}
          </div>
          {tabIdx < TABS.length - 1 ? (
            <Button size="lg" type="button" onClick={() => goToTab(TABS[tabIdx + 1])}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" type="button" disabled={loading} onClick={handleSubmit}>
              {loading ? "Saving…" : "Add Student"}
              {!loading && <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
