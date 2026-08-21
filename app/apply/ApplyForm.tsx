"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface Props { accentColor: string; schoolName: string; }

const EMPTY_FORM = {
  firstName: "", lastName: "", dateOfBirth: "", gender: "",
  classAppliedFor: "", parentName: "", parentPhone: "", parentEmail: "",
  address: "", notes: "",
};

const fieldClass =
  "w-full px-4 py-3 border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all";
const labelClass = "block text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-1.5";

export function ApplyForm({ accentColor, schoolName }: Props) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [honeypot, setHoneypot] = useState("");
  const [renderedAt]            = useState(() => Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const ringStyle = { "--tw-ring-color": `${accentColor}35` } as React.CSSProperties;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admissions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dateOfBirth: new Date(form.dateOfBirth), website: honeypot, renderedAt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Submission failed — please try again");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 px-6 sm:px-10 py-14 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white" style={{ background: accentColor }}>
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="font-bitter text-[24px] font-bold text-[#0d253d] mb-2">Application received</h2>
        <p className="text-[#64748d] text-[14.5px] max-w-sm mx-auto leading-relaxed">
          Thank you for applying to {schoolName}. Their admissions team will review your application and reach out on the phone number you provided.
        </p>
        <button
          onClick={() => { setForm(EMPTY_FORM); setSubmitted(false); }}
          className="mt-6 text-[13px] font-semibold hover:underline"
          style={{ color: accentColor }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-slate-200/80 px-6 sm:px-10 py-8 sm:py-10 space-y-7">

      {/* Honeypot — invisible to real visitors, but form-filling bots tend to
          fill every input they find. Off-screen rather than display:none,
          since some bots skip visibility:hidden/display:none fields
          specifically to evade this trick. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="apply-website">Website</label>
        <input id="apply-website" type="text" tabIndex={-1} autoComplete="off"
          value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      {error && (
        <div role="alert" className="text-red-700 bg-red-50 border border-red-200 text-[13px] rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Student information */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: accentColor }}>Student Information</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <input id="firstName" value={form.firstName} onChange={set("firstName")} required className={fieldClass} style={ringStyle} />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <input id="lastName" value={form.lastName} onChange={set("lastName")} required className={fieldClass} style={ringStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth</label>
              <input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} required className={fieldClass} style={ringStyle} />
            </div>
            <div>
              <label htmlFor="gender" className={labelClass}>Gender</label>
              <select id="gender" value={form.gender} onChange={set("gender")} required className={`${fieldClass} appearance-none`} style={{
                ...ringStyle,
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 40,
              }}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="classAppliedFor" className={labelClass}>Class Applied For</label>
            <input id="classAppliedFor" placeholder="e.g. Grade 7, Form 1" value={form.classAppliedFor} onChange={set("classAppliedFor")} required className={fieldClass} style={ringStyle} />
          </div>
        </div>
      </div>

      {/* Parent / guardian information */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: accentColor }}>Parent / Guardian Information</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="parentName" className={labelClass}>Full Name</label>
              <input id="parentName" value={form.parentName} onChange={set("parentName")} required className={fieldClass} style={ringStyle} />
            </div>
            <div>
              <label htmlFor="parentPhone" className={labelClass}>Phone Number</label>
              <input id="parentPhone" type="tel" value={form.parentPhone} onChange={set("parentPhone")} required className={fieldClass} style={ringStyle} />
            </div>
          </div>

          <div>
            <label htmlFor="parentEmail" className={labelClass}>Email Address <span className="normal-case font-medium text-slate-300">(optional)</span></label>
            <input id="parentEmail" type="email" value={form.parentEmail} onChange={set("parentEmail")} className={fieldClass} style={ringStyle} />
          </div>

          <div>
            <label htmlFor="address" className={labelClass}>Home Address <span className="normal-case font-medium text-slate-300">(optional)</span></label>
            <input id="address" value={form.address} onChange={set("address")} className={fieldClass} style={ringStyle} />
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>Additional Notes <span className="normal-case font-medium text-slate-300">(optional)</span></label>
            <textarea id="notes" rows={3} value={form.notes} onChange={set("notes")} className={`${fieldClass} resize-none`} style={ringStyle} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-[15px] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.99]"
        style={{ background: accentColor }}
      >
        {loading ? "Submitting…" : <>Submit Application <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}
