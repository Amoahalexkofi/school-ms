"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, Search, Eye } from "lucide-react";

type Props = { students: any[]; sessions: any[]; classSections: any[]; schoolHouses: any[] };

const TABS = ["Basic Info", "Guardian", "Address", "Academic", "Other"] as const;
type Tab = typeof TABS[number];

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const GENDERS = ["Male","Female","Other"];
const RELIGIONS = ["Christian","Muslim","Traditional","Other"];
const GUARDIAN_IS = ["Father","Mother","Guardian","Other"];

export function StudentsClient({ students, sessions, classSections, schoolHouses }: Props) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<Tab>("Basic Info");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  const [form, setForm] = useState({
    // Basic
    firstName: "", middleName: "", lastName: "", admissionDate: "",
    dateOfBirth: "", gender: "", bloodGroup: "", religion: "",
    caste: "", category: "", nationality: "", rte: false, mobileNo: "", email: "",
    // Guardian
    guardianIs: "Father",
    fatherName: "", fatherPhone: "", fatherOccupation: "",
    motherName: "", motherPhone: "", motherOccupation: "",
    guardianName: "", guardianRelation: "", guardianPhone: "",
    guardianEmail: "", guardianOccupation: "", guardianAddress: "",
    // Address
    currentAddress: "", permanentAddress: "", city: "", state: "", country: "", pincode: "",
    // Academic
    sessionId: sessions[0]?.id ?? "",
    classSectionId: classSections[0]?.id ?? "",
    rollNo: "", schoolHouseId: "", previousSchool: "",
    // Other
    height: "", weight: "", bankAccountNo: "", bankName: "",
    ifscCode: "", aadharNo: "", note: "", about: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = students.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.admissionNo?.toLowerCase().includes(q) ||
      s.mobileNo?.toLowerCase().includes(q)
    );
  });

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender) {
      setError("First name, last name, date of birth and gender are required.");
      setTab("Basic Info");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rte: form.rte }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setOpen(false);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function Field({ label, name, type = "text", options, textarea }: {
    label: string; name: string; type?: string;
    options?: string[] | { value: string; label: string }[];
    textarea?: boolean;
  }) {
    if (options) {
      return (
        <div>
          <Label className="text-xs">{label}</Label>
          <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={(form as any)[name]} onChange={set(name)}>
            <option value="">— Select —</option>
            {options.map(o => typeof o === "string"
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
            )}
          </select>
        </div>
      );
    }
    if (textarea) {
      return (
        <div className="col-span-2">
          <Label className="text-xs">{label}</Label>
          <textarea rows={2} className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={(form as any)[name]} onChange={set(name)} />
        </div>
      );
    }
    return (
      <div>
        <Label className="text-xs">{label}</Label>
        <Input className="mt-1" type={type} value={(form as any)[name]} onChange={set(name)} />
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9 w-64" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <Button onClick={() => { setError(""); setTab("Basic Info"); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Student
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No students found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Class / Section</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Roll No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Mobile</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((s: any) => {
                    const enroll = s.sessions?.[0];
                    const cls    = enroll?.classSection;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}</div>
                          {s.schoolHouse && <div className="text-xs text-gray-400">{s.schoolHouse.name}</div>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {cls ? `${cls.class.name} – ${cls.section.name}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{enroll?.rollNo ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{s.mobileNo ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{s.gender ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/students/${s.id}`}>
                            <Button size="sm" variant="outline"><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 border-b mb-4">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">

            {/* ── Basic Info ── */}
            {tab === "Basic Info" && <>
              <Field label="First Name *" name="firstName" />
              <Field label="Middle Name" name="middleName" />
              <Field label="Last Name *" name="lastName" />
              <Field label="Admission Date" name="admissionDate" type="date" />
              <Field label="Date of Birth *" name="dateOfBirth" type="date" />
              <Field label="Gender *" name="gender" options={GENDERS} />
              <Field label="Blood Group" name="bloodGroup" options={BLOOD_GROUPS} />
              <Field label="Religion" name="religion" options={RELIGIONS} />
              <Field label="Caste / Category" name="caste" />
              <Field label="Nationality" name="nationality" />
              <Field label="Mobile No." name="mobileNo" />
              <Field label="Email" name="email" type="email" />
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="rte" checked={form.rte} onChange={e => setForm(f => ({ ...f, rte: e.target.checked }))} />
                <Label htmlFor="rte" className="text-sm cursor-pointer">RTE (Right to Education) student</Label>
              </div>
            </>}

            {/* ── Guardian ── */}
            {tab === "Guardian" && <>
              <Field label="Guardian Is" name="guardianIs" options={GUARDIAN_IS} />
              <div /> {/* spacer */}
              <Field label="Father's Name" name="fatherName" />
              <Field label="Father's Phone" name="fatherPhone" />
              <Field label="Father's Occupation" name="fatherOccupation" />
              <div />
              <Field label="Mother's Name" name="motherName" />
              <Field label="Mother's Phone" name="motherPhone" />
              <Field label="Mother's Occupation" name="motherOccupation" />
              <div />
              <Field label="Guardian Name" name="guardianName" />
              <Field label="Guardian Relation" name="guardianRelation" />
              <Field label="Guardian Phone" name="guardianPhone" />
              <Field label="Guardian Email" name="guardianEmail" type="email" />
              <Field label="Guardian Occupation" name="guardianOccupation" />
              <Field label="Guardian Address" name="guardianAddress" textarea />
            </>}

            {/* ── Address ── */}
            {tab === "Address" && <>
              <Field label="Current Address" name="currentAddress" textarea />
              <Field label="Permanent Address" name="permanentAddress" textarea />
              <Field label="City" name="city" />
              <Field label="State / Region" name="state" />
              <Field label="Country" name="country" />
              <Field label="Pincode / Post Code" name="pincode" />
            </>}

            {/* ── Academic ── */}
            {tab === "Academic" && <>
              <div>
                <Label className="text-xs">Session</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.sessionId} onChange={set("sessionId")}>
                  <option value="">— None —</option>
                  {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Class / Section</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.classSectionId} onChange={set("classSectionId")}>
                  <option value="">— None —</option>
                  {classSections.map((cs: any) => (
                    <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                  ))}
                </select>
              </div>
              <Field label="Roll No." name="rollNo" />
              <div>
                <Label className="text-xs">School House</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.schoolHouseId} onChange={set("schoolHouseId")}>
                  <option value="">— None —</option>
                  {schoolHouses.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <Field label="Previous School" name="previousSchool" textarea />
            </>}

            {/* ── Other ── */}
            {tab === "Other" && <>
              <Field label="Height (cm)" name="height" />
              <Field label="Weight (kg)" name="weight" />
              <Field label="Bank Account No." name="bankAccountNo" />
              <Field label="Bank Name" name="bankName" />
              <Field label="IFSC / Sort Code" name="ifscCode" />
              <Field label="Aadhar / National ID" name="aadharNo" />
              <Field label="Note" name="note" textarea />
              <Field label="About" name="about" textarea />
            </>}
          </div>

          {error && <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-2 rounded">{error}</p>}

          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              {tab !== "Basic Info" && (
                <Button variant="outline" onClick={() => setTab(TABS[TABS.indexOf(tab) - 1])}>← Back</Button>
              )}
              {tab !== "Other" && (
                <Button variant="outline" onClick={() => setTab(TABS[TABS.indexOf(tab) + 1])}>Next →</Button>
              )}
            </div>
            {tab === "Other" && (
              <Button disabled={loading} onClick={handleSubmit}>
                {loading ? "Saving…" : "Add Student"}
              </Button>
            )}
            {tab !== "Other" && (
              <Button disabled={loading} onClick={handleSubmit}>
                {loading ? "Saving…" : "Save Now"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
