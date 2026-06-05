"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const TABS = ["Basic Info", "Guardian", "Address", "Academic", "Other"] as const;
type Tab = typeof TABS[number];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];
const RELIGIONS = ["Christian", "Muslim", "Traditional", "Other"];
const GUARDIAN_IS = ["Father", "Mother", "Guardian", "Other"];

type Props = {
  sessions: any[];
  classSections: any[];
  schoolHouses: any[];
};

export function AddStudentForm({ sessions, classSections, schoolHouses }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Basic Info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Basic
    firstName: "", middleName: "", lastName: "", admissionNo: "",
    admissionDate: "", dateOfBirth: "", gender: "", bloodGroup: "",
    religion: "", caste: "", category: "", nationality: "",
    mobileNo: "", email: "", rte: false,
    height: "", weight: "",
    // Guardian
    guardianIs: "Father",
    fatherName: "", fatherPhone: "", fatherEmail: "", fatherOccupation: "",
    motherName: "", motherPhone: "", motherEmail: "", motherOccupation: "",
    guardianName: "", guardianRelation: "", guardianPhone: "",
    guardianEmail: "", guardianOccupation: "", guardianAddress: "",
    // Address
    currentAddress: "", permanentAddress: "", city: "", state: "", country: "", pincode: "",
    // Academic
    sessionId: sessions[0]?.id ?? "",
    classSectionId: classSections[0]?.id ?? "",
    rollNo: "", schoolHouseId: "",
    previousSchool: "", previousClass: "", previousPercent: "", previousTc: "",
    // Other
    bankAccountNo: "", bankName: "", ifscCode: "", bankBranch: "",
    aadharNo: "", note: "", about: "",
  });

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender) {
      setError("First name, last name, date of birth and gender are required.");
      setTab("Basic Info");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push("/students");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function Field({
    label, name, type = "text", options, textarea, colSpan2,
  }: {
    label: string;
    name: string;
    type?: string;
    options?: string[] | { value: string; label: string }[];
    textarea?: boolean;
    colSpan2?: boolean;
  }) {
    if (options) {
      return (
        <div className={colSpan2 ? "col-span-2" : ""}>
          <Label className="text-xs mb-1 block">{label}</Label>
          <select className={SEL} value={(form as any)[name]} onChange={set(name)}>
            <option value="">— Select —</option>
            {options.map((o) =>
              typeof o === "string" ? (
                <option key={o} value={o}>{o}</option>
              ) : (
                <option key={o.value} value={o.value}>{o.label}</option>
              )
            )}
          </select>
        </div>
      );
    }
    if (textarea) {
      return (
        <div className={colSpan2 ? "col-span-2" : ""}>
          <Label className="text-xs mb-1 block">{label}</Label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={(form as any)[name]}
            onChange={set(name)}
          />
        </div>
      );
    }
    return (
      <div className={colSpan2 ? "col-span-2" : ""}>
        <Label className="text-xs mb-1 block">{label}</Label>
        <Input type={type} value={(form as any)[name]} onChange={set(name)} />
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/students"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
        </Link>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* ── Basic Info ── */}
        {tab === "Basic Info" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name *" name="firstName" />
                <Field label="Middle Name" name="middleName" />
                <Field label="Last Name *" name="lastName" />
                <Field label="Admission No." name="admissionNo" />
                <Field label="Admission Date" name="admissionDate" type="date" />
                <Field label="Date of Birth *" name="dateOfBirth" type="date" />
                <Field label="Gender *" name="gender" options={GENDERS} />
                <Field label="Blood Group" name="bloodGroup" options={BLOOD_GROUPS} />
                <Field label="Religion" name="religion" options={RELIGIONS} />
                <Field label="Caste / Category" name="caste" />
                <Field label="Nationality" name="nationality" />
                <Field label="Mobile No." name="mobileNo" />
                <Field label="Email" name="email" type="email" />
                <Field label="Height (cm)" name="height" />
                <Field label="Weight (kg)" name="weight" />
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rte"
                    checked={form.rte}
                    onChange={(e) => setForm((f) => ({ ...f, rte: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="rte" className="text-sm cursor-pointer">
                    RTE (Right to Education) student
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Guardian ── */}
        {tab === "Guardian" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guardian Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Guardian Is" name="guardianIs" options={GUARDIAN_IS} />
                <div />
                <Field label="Father's Name" name="fatherName" />
                <Field label="Father's Phone" name="fatherPhone" />
                <Field label="Father's Email" name="fatherEmail" type="email" />
                <Field label="Father's Occupation" name="fatherOccupation" />
                <Field label="Mother's Name" name="motherName" />
                <Field label="Mother's Phone" name="motherPhone" />
                <Field label="Mother's Email" name="motherEmail" type="email" />
                <Field label="Mother's Occupation" name="motherOccupation" />
                <Field label="Guardian Name" name="guardianName" />
                <Field label="Guardian Relation" name="guardianRelation" />
                <Field label="Guardian Phone" name="guardianPhone" />
                <Field label="Guardian Email" name="guardianEmail" type="email" />
                <Field label="Guardian Occupation" name="guardianOccupation" />
                <Field label="Guardian Address" name="guardianAddress" textarea colSpan2 />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Address ── */}
        {tab === "Address" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Address Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Current Address" name="currentAddress" textarea colSpan2 />
                <Field label="Permanent Address" name="permanentAddress" textarea colSpan2 />
                <Field label="City" name="city" />
                <Field label="State / Region" name="state" />
                <Field label="Country" name="country" />
                <Field label="Pincode / Post Code" name="pincode" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Academic ── */}
        {tab === "Academic" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1 block">Session</Label>
                  <select className={SEL} value={form.sessionId} onChange={set("sessionId")}>
                    <option value="">— None —</option>
                    {sessions.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.session ?? s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Class / Section</Label>
                  <select className={SEL} value={form.classSectionId} onChange={set("classSectionId")}>
                    <option value="">— None —</option>
                    {classSections.map((cs: any) => (
                      <option key={cs.id} value={cs.id}>
                        {cs.class.name} – {cs.section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label="Roll No." name="rollNo" />
                <div>
                  <Label className="text-xs mb-1 block">School House</Label>
                  <select className={SEL} value={form.schoolHouseId} onChange={set("schoolHouseId")}>
                    <option value="">— None —</option>
                    {schoolHouses.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <Field label="Previous School" name="previousSchool" />
                <Field label="Previous Class" name="previousClass" />
                <Field label="Previous Percentage (%)" name="previousPercent" />
                <Field label="Previous TC No." name="previousTc" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Other ── */}
        {tab === "Other" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Other Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Bank Account No." name="bankAccountNo" />
                <Field label="Bank Name" name="bankName" />
                <Field label="IFSC / Sort Code" name="ifscCode" />
                <Field label="Bank Branch" name="bankBranch" />
                <Field label="Aadhar / National ID" name="aadharNo" />
                <div />
                <Field label="Note" name="note" textarea colSpan2 />
                <Field label="About" name="about" textarea colSpan2 />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation + Save */}
        <div className="flex items-center justify-between pb-6">
          <div className="flex gap-2">
            {tab !== "Basic Info" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setTab(TABS[TABS.indexOf(tab) - 1])}
              >
                ← Back
              </Button>
            )}
            {tab !== "Other" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setTab(TABS[TABS.indexOf(tab) + 1])}
              >
                Next →
              </Button>
            )}
          </div>
          <Button type="button" disabled={loading} onClick={handleSubmit}>
            {loading ? "Saving…" : "Add Student"}
          </Button>
        </div>
      </div>
    </main>
  );
}
