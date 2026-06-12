"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Building2, CalendarDays, Layers, BookOpen, CheckCircle2, ArrowRight, ArrowLeft, Plus, X, Loader2 } from "lucide-react";

// ── Preset data for Ghanaian / West African schools ────────────────────────

const CLASS_PRESETS = {
  primary:     ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"],
  jhs:         ["JHS 1", "JHS 2", "JHS 3"],
  shs:         ["SHS 1", "SHS 2", "SHS 3"],
  "primary+jhs": ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 1", "JHS 2", "JHS 3"],
  custom:      [],
};

const SUBJECT_PRESETS = [
  "English Language", "Mathematics", "Integrated Science", "Social Studies",
  "ICT", "French", "Religious & Moral Education", "Creative Arts",
  "Ghanaian Language", "Physical Education",
];

const STEPS = [
  { id: "profile",  label: "School Profile", icon: Building2 },
  { id: "session",  label: "Academic Session", icon: CalendarDays },
  { id: "classes",  label: "Classes & Sections", icon: Layers },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "done",     label: "Done", icon: CheckCircle2 },
];

type Props = { profile: any };

export function OnboardingClient({ profile }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  // ── Step 1: Profile ────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:     profile?.name     ?? "",
    address:  profile?.address  ?? "",
    phone:    profile?.phone    ?? "",
    email:    profile?.email    ?? "",
    currency: profile?.currency ?? "GHS",
    motto:    profile?.motto    ?? "",
  });

  // ── Step 2: Session ────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const [sessionForm, setSessionForm] = useState({
    session:   `${currentYear}/${currentYear + 1}`,
    startDate: `${currentYear}-09-01`,
    endDate:   `${currentYear + 1}-07-31`,
  });

  // ── Step 3: Classes & Sections ─────────────────────────────────────────────
  const [selectedPreset, setSelectedPreset] = useState<string>("primary+jhs");
  const [classes, setClasses]               = useState<string[]>([...CLASS_PRESETS["primary+jhs"]]);
  const [customClass, setCustomClass]       = useState("");
  const [sections, setSections]             = useState<string[]>(["A", "B"]);
  const [customSection, setCustomSection]   = useState("");

  // ── Step 4: Subjects ───────────────────────────────────────────────────────
  const [subjects, setSubjects]       = useState<string[]>([...SUBJECT_PRESETS.slice(0, 6)]);
  const [customSubject, setCustomSubject] = useState("");

  // ── helpers ────────────────────────────────────────────────────────────────
  function addItem(list: string[], setList: (v: string[]) => void, val: string, setVal: (v: string) => void) {
    const trimmed = val.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    setVal("");
  }

  function removeItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.filter(x => x !== item));
  }

  function applyPreset(key: string) {
    setSelectedPreset(key);
    if (key !== "custom") setClasses([...CLASS_PRESETS[key as keyof typeof CLASS_PRESETS]]);
  }

  // ── save handlers ──────────────────────────────────────────────────────────

  async function saveProfile() {
    if (!profileForm.name.trim()) { setError("School name is required"); return false; }
    setError("");
    const res = await fetch("/api/school-profile", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(profileForm),
    });
    return res.ok;
  }

  async function saveSession() {
    if (!sessionForm.session.trim()) { setError("Session name is required"); return false; }
    setError("");
    const res = await fetch("/api/sessions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name:      sessionForm.session,
        startDate: sessionForm.startDate,
        endDate:   sessionForm.endDate,
        setActive: true,
      }),
    });
    return res.ok;
  }

  async function saveClassesAndSections() {
    if (classes.length === 0) { setError("Add at least one class"); return false; }
    setError("");
    // Create sections first
    const sectionIds: Record<string, string> = {};
    for (const sec of sections) {
      const r = await fetch("/api/sections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sec }),
      });
      if (r.ok) { const d = await r.json(); sectionIds[sec] = d.id; }
    }
    // Create classes + link sections
    for (const cls of classes) {
      const r = await fetch("/api/classes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cls }),
      });
      if (!r.ok) continue;
      const { id: classId } = await r.json();
      // Create ClassSection junction for each section
      for (const sec of sections) {
        if (sectionIds[sec]) {
          await fetch("/api/class-sections", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ classId, sectionId: sectionIds[sec] }),
          });
        }
      }
    }
    return true;
  }

  async function saveSubjects() {
    setError("");
    for (const name of subjects) {
      await fetch("/api/subjects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: "Compulsory", code: name.slice(0, 3).toUpperCase() }),
      });
    }
    return true;
  }

  async function completeOnboarding() {
    const res = await fetch("/api/school-profile", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ onboardingCompleted: true }),
    });
    return res.ok;
  }

  async function handleNext() {
    setSaving(true);
    try {
      let ok = true;
      if (step === 0) ok = await saveProfile();
      if (step === 1) ok = await saveSession();
      if (step === 2) ok = await saveClassesAndSections();
      if (step === 3) {
        await saveSubjects();
        ok = await completeOnboarding();
      }
      if (ok) setStep(s => s + 1);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-start justify-center p-6">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl mb-3 shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Skula</h1>
          <p className="text-gray-500 text-sm mt-1">Let's get your school set up in 4 quick steps</p>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-8">
            {STEPS.slice(0, 4).map((s, i) => {
              const Icon = s.icon;
              const done    = i < step;
              const current = i === step;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      done    ? "bg-blue-600 text-white" :
                      current ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                                "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-xs mt-1 font-medium whitespace-nowrap ${current ? "text-blue-600" : done ? "text-gray-600" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">

          {/* ── Step 0: Profile ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">School Profile</h2>
                <p className="text-sm text-gray-500 mt-0.5">Basic information about your school</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                  <Input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Lincoln International School" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+233 XX XXX XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} placeholder="info@school.edu.gh" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} placeholder="School street address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileForm.currency} onChange={e => setProfileForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="GHS">GHS — Ghana Cedi</option>
                    <option value="NGN">NGN — Nigerian Naira</option>
                    <option value="KES">KES — Kenyan Shilling</option>
                    <option value="ZAR">ZAR — South African Rand</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Motto</label>
                  <Input value={profileForm.motto} onChange={e => setProfileForm(f => ({ ...f, motto: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Session ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Academic Session</h2>
                <p className="text-sm text-gray-500 mt-0.5">Create your first academic year / term</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Name *</label>
                  <Input value={sessionForm.session} onChange={e => setSessionForm(f => ({ ...f, session: e.target.value }))} placeholder="e.g. 2025/2026" />
                  <p className="text-xs text-gray-400 mt-1">This will be set as your current active session</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input type="date" value={sessionForm.startDate} onChange={e => setSessionForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input type="date" value={sessionForm.endDate} onChange={e => setSessionForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Classes & Sections ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Classes & Sections</h2>
                <p className="text-sm text-gray-500 mt-0.5">Pick a template or customise your class structure</p>
              </div>

              {/* Preset buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "primary",     label: "Primary (1–6)" },
                    { key: "jhs",         label: "JHS (1–3)" },
                    { key: "shs",         label: "SHS (1–3)" },
                    { key: "primary+jhs", label: "Primary + JHS" },
                    { key: "custom",      label: "Custom" },
                  ].map(p => (
                    <button key={p.key} onClick={() => applyPreset(p.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        selectedPreset === p.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Classes ({classes.length})</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {classes.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {c}
                      <button onClick={() => removeItem(classes, setClasses, c)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add class name" value={customClass} onChange={e => setCustomClass(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem(classes, setClasses, customClass, setCustomClass)} className="h-8 text-sm" />
                  <Button size="sm" variant="outline" onClick={() => addItem(classes, setClasses, customClass, setCustomClass)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Sections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sections per class</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {sections.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                      {s}
                      <button onClick={() => removeItem(sections, setSections, s)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="e.g. A or Gold" value={customSection} onChange={e => setCustomSection(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem(sections, setSections, customSection, setCustomSection)} className="h-8 text-sm" />
                  <Button size="sm" variant="outline" onClick={() => addItem(sections, setSections, customSection, setCustomSection)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Each class above will get all these sections</p>
              </div>
            </div>
          )}

          {/* ── Step 3: Subjects ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Subjects</h2>
                <p className="text-sm text-gray-500 mt-0.5">Add your core subjects — you can always add more later</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick add</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUBJECT_PRESETS.map(s => (
                    <button key={s} onClick={() => subjects.includes(s) ? removeItem(subjects, setSubjects, s) : setSubjects([...subjects, s])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        subjects.includes(s) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected ({subjects.length})</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {subjects.filter(s => !SUBJECT_PRESETS.includes(s)).map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      {s}
                      <button onClick={() => removeItem(subjects, setSubjects, s)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add custom subject" value={customSubject} onChange={e => setCustomSubject(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem(subjects, setSubjects, customSubject, setCustomSubject)} className="h-8 text-sm" />
                  <Button size="sm" variant="outline" onClick={() => addItem(subjects, setSubjects, customSubject, setCustomSubject)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Done ── */}
          {step === 4 && (
            <div className="text-center py-6 space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">You're all set!</h2>
                <p className="text-gray-500 text-sm mt-1">Your school is configured and ready to go.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm pt-2">
                {[
                  { label: "Add Students", href: "/students/new", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                  { label: "Add Staff", href: "/staff/new", color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
                  { label: "Set Up Fees", href: "/fees/setup", color: "bg-green-50 text-green-700 hover:bg-green-100" },
                ].map(({ label, href, color }) => (
                  <a key={href} href={href}
                    className={`rounded-xl px-4 py-3 font-medium transition-colors text-center ${color}`}>
                    {label}
                  </a>
                ))}
              </div>
              <Button className="w-full mt-2" onClick={() => router.push("/dashboard")}>
                Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-7 pt-5 border-t">
              <Button variant="ghost" size="sm" disabled={step === 0 || saving} onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button className="text-sm text-gray-400 hover:text-gray-600" onClick={async () => {
                    if (step === 3) { await completeOnboarding(); }
                    setStep(s => s + 1);
                  }}>
                    Skip this step
                  </button>
                )}
                <Button disabled={saving} onClick={handleNext}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving…</> : <>
                    {step === 3 ? "Finish Setup" : "Save & Continue"} <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Step counter */}
        {step < 4 && (
          <p className="text-center text-xs text-gray-400 mt-4">Step {step + 1} of 4</p>
        )}
      </div>
    </div>
  );
}
