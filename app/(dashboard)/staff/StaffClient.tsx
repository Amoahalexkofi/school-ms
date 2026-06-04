"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  UserCog, Plus, Search, Eye, X,
  User, Briefcase, Phone, DollarSign, Share2,
} from "lucide-react";

type Props = { staff: any[]; departments: any[]; designations: any[] };

const TABS = [
  { key: "Personal",   label: "Personal Info",  icon: User },
  { key: "Employment", label: "Employment",      icon: Briefcase },
  { key: "Contact",    label: "Contact",         icon: Phone },
  { key: "Financial",  label: "Financial",       icon: DollarSign },
  { key: "Social",     label: "Social & Notes",  icon: Share2 },
] as const;
type TabKey = typeof TABS[number]["key"];

const GENDERS   = ["Male", "Female", "Other"];
const RELIGIONS = ["Christian", "Muslim", "Traditional", "Other"];
const MARITAL   = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
const CONTRACTS = ["PERMANENT", "CONTRACT", "TEMPORARY"];
const ROLES     = ["TEACHER", "ADMIN", "ACCOUNTANT", "LIBRARIAN", "SUPER_ADMIN"];

const ROLE_STYLE: Record<string, string> = {
  TEACHER:     "bg-green-100 text-green-700",
  ADMIN:       "bg-blue-100 text-blue-700",
  ACCOUNTANT:  "bg-yellow-100 text-yellow-700",
  LIBRARIAN:   "bg-pink-100 text-pink-700",
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
};

const emptyForm = {
  firstName: "", lastName: "", fatherName: "", motherName: "",
  dob: "", gender: "", maritalStatus: "", religion: "", qualification: "", workExperience: "",
  employeeId: "", role: "TEACHER", departmentId: "", designationId: "",
  dateOfJoining: "", contractType: "", payscale: "", shift: "", location: "",
  email: "", contactNo: "", emergencyContact: "",
  localAddress: "", permanentAddress: "", city: "", state: "", country: "",
  basicSalary: "", bankAccountNo: "", bankName: "", ifscCode: "", bankBranch: "", epfNo: "",
  facebook: "", twitter: "", linkedin: "", instagram: "", note: "",
};

// ── Shared field components ────────────────────────────────────────────────────

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 mt-5 first:mt-0">
      {children}
    </h3>
  );
}

function F({
  label, name, type = "text", value, onChange, options, span, rows,
}: {
  label: string; name: string; type?: string;
  value: string; onChange: (e: React.ChangeEvent<any>) => void;
  options?: string[] | { value: string; label: string }[];
  span?: boolean; rows?: number;
}) {
  const inputCls = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
  const labelCls = "block text-xs font-medium text-gray-600 mb-0.5";

  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      {options ? (
        <select className={inputCls} value={value} onChange={onChange}>
          <option value="">— Select —</option>
          {options.map(o =>
            typeof o === "string"
              ? <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
      ) : rows ? (
        <textarea rows={rows} className={inputCls + " resize-none"} value={value} onChange={onChange} />
      ) : (
        <input type={type} className={inputCls} value={value} onChange={onChange} />
      )}
    </div>
  );
}

export function StaffClient({ staff, departments, designations }: Props) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<TabKey>("Personal");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [form, setForm]       = useState(emptyForm);

  const set = (k: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const ok = !search || [s.firstName, s.lastName, s.employeeId, s.contactNo]
      .some(v => v?.toLowerCase().includes(q));
    return ok && (!filterDept || s.departmentId === filterDept);
  });

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.gender) {
      setError("First name, last name, and gender are required.");
      setTab("Personal");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setOpen(false);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function openFresh() {
    setForm(emptyForm); setError(""); setTab("Personal"); setOpen(true);
  }

  const deptOptions  = departments.map((d: any)  => ({ value: d.id, label: d.name }));
  const desigOptions = designations.map((d: any) => ({ value: d.id, label: d.name }));
  const tabIdx       = TABS.findIndex(t => t.key === tab);

  return (
    <main className="flex-1 p-6 space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9 w-64" placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <Button onClick={openFresh}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Staff
        </Button>
      </div>

      {/* ── Table ── */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No staff found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Employee ID","Name","Role","Department","Designation","Contact","Status",""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.employeeId}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-gray-400">{s.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[s.user?.role] ?? "bg-gray-100 text-gray-600"}`}>
                          {s.user?.role?.replace(/_/g, " ") ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.department?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{s.designation?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{s.contactNo ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/staff/${s.id}`}>
                          <Button size="sm" variant="outline"><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Staff Modal ── */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="p-0 gap-0 max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col [&>button]:hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Add New Staff Member</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details across all sections before saving.</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body: left nav + right form */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* Left: vertical tab nav */}
            <aside className="w-52 shrink-0 border-r bg-gray-50 py-4 px-3 space-y-1 overflow-y-auto">
              {TABS.map((t, i) => {
                const Icon = t.icon;
                const done = i < tabIdx;
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : done
                        ? "text-green-700 bg-green-50 hover:bg-green-100"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t.label}</span>
                    {done && !active && (
                      <span className="ml-auto text-xs text-green-600">✓</span>
                    )}
                  </button>
                );
              })}
            </aside>

            {/* Right: form content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

              {/* ── Personal Info ── */}
              {tab === "Personal" && (
                <div className="space-y-4">
                  <SectionTitle>Basic Information</SectionTitle>
                  <FieldGroup>
                    <F label="First Name *" name="firstName" value={form.firstName} onChange={set("firstName")} />
                    <F label="Last Name *"  name="lastName"  value={form.lastName}  onChange={set("lastName")} />
                    <F label="Father's Name" name="fatherName" value={form.fatherName} onChange={set("fatherName")} />
                    <F label="Mother's Name" name="motherName" value={form.motherName} onChange={set("motherName")} />
                    <F label="Date of Birth" name="dob" type="date" value={form.dob} onChange={set("dob")} />
                    <F label="Gender *" name="gender" value={form.gender} onChange={set("gender")} options={GENDERS} />
                    <F label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={set("maritalStatus")} options={MARITAL} />
                    <F label="Religion" name="religion" value={form.religion} onChange={set("religion")} options={RELIGIONS} />
                  </FieldGroup>
                  <SectionTitle>Education & Experience</SectionTitle>
                  <FieldGroup>
                    <F label="Qualification" name="qualification" value={form.qualification} onChange={set("qualification")} />
                    <F label="Work Experience" name="workExperience" value={form.workExperience} onChange={set("workExperience")} />
                  </FieldGroup>
                </div>
              )}

              {/* ── Employment ── */}
              {tab === "Employment" && (
                <div className="space-y-4">
                  <SectionTitle>Identity & Role</SectionTitle>
                  <FieldGroup>
                    <F label="Employee ID (auto if blank)" name="employeeId" value={form.employeeId} onChange={set("employeeId")} />
                    <F label="Role" name="role" value={form.role} onChange={set("role")} options={ROLES} />
                    <F label="Department" name="departmentId" value={form.departmentId} onChange={set("departmentId")} options={deptOptions} />
                    <F label="Designation" name="designationId" value={form.designationId} onChange={set("designationId")} options={desigOptions} />
                  </FieldGroup>
                  <SectionTitle>Contract & Schedule</SectionTitle>
                  <FieldGroup>
                    <F label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={set("dateOfJoining")} />
                    <F label="Contract Type" name="contractType" value={form.contractType} onChange={set("contractType")} options={CONTRACTS} />
                    <F label="Payscale" name="payscale" value={form.payscale} onChange={set("payscale")} />
                    <F label="Shift" name="shift" value={form.shift} onChange={set("shift")} />
                    <F label="Location / Branch" name="location" value={form.location} onChange={set("location")} />
                  </FieldGroup>
                </div>
              )}

              {/* ── Contact ── */}
              {tab === "Contact" && (
                <div className="space-y-4">
                  <SectionTitle>Contact Details</SectionTitle>
                  <FieldGroup>
                    <F label="Email Address" name="email" type="email" value={form.email} onChange={set("email")} />
                    <F label="Contact / Mobile No." name="contactNo" value={form.contactNo} onChange={set("contactNo")} />
                    <F label="Emergency Contact" name="emergencyContact" value={form.emergencyContact} onChange={set("emergencyContact")} />
                  </FieldGroup>
                  <SectionTitle>Address</SectionTitle>
                  <FieldGroup>
                    <F label="Local Address" name="localAddress" value={form.localAddress} onChange={set("localAddress")} rows={3} span />
                    <F label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={set("permanentAddress")} rows={3} span />
                    <F label="City" name="city" value={form.city} onChange={set("city")} />
                    <F label="State / Region" name="state" value={form.state} onChange={set("state")} />
                    <F label="Country" name="country" value={form.country} onChange={set("country")} />
                  </FieldGroup>
                </div>
              )}

              {/* ── Financial ── */}
              {tab === "Financial" && (
                <div className="space-y-4">
                  <SectionTitle>Salary</SectionTitle>
                  <FieldGroup>
                    <F label="Basic Salary (₵)" name="basicSalary" type="number" value={form.basicSalary} onChange={set("basicSalary")} />
                    <F label="EPF / Pension No." name="epfNo" value={form.epfNo} onChange={set("epfNo")} />
                  </FieldGroup>
                  <SectionTitle>Bank Details</SectionTitle>
                  <FieldGroup>
                    <F label="Bank Name" name="bankName" value={form.bankName} onChange={set("bankName")} />
                    <F label="Account No." name="bankAccountNo" value={form.bankAccountNo} onChange={set("bankAccountNo")} />
                    <F label="IFSC / Sort Code" name="ifscCode" value={form.ifscCode} onChange={set("ifscCode")} />
                    <F label="Bank Branch" name="bankBranch" value={form.bankBranch} onChange={set("bankBranch")} />
                  </FieldGroup>
                </div>
              )}

              {/* ── Social & Notes ── */}
              {tab === "Social" && (
                <div className="space-y-4">
                  <SectionTitle>Social Media</SectionTitle>
                  <FieldGroup>
                    <F label="Facebook URL" name="facebook" value={form.facebook} onChange={set("facebook")} />
                    <F label="Twitter / X URL" name="twitter" value={form.twitter} onChange={set("twitter")} />
                    <F label="LinkedIn URL" name="linkedin" value={form.linkedin} onChange={set("linkedin")} />
                    <F label="Instagram URL" name="instagram" value={form.instagram} onChange={set("instagram")} />
                  </FieldGroup>
                  <SectionTitle>Additional Notes</SectionTitle>
                  <F label="Note" name="note" value={form.note} onChange={set("note")} rows={4} span />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t bg-gray-50 px-6 py-4 flex items-center justify-between gap-3">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-1">
                {error}
              </p>
            )}
            {!error && (
              <p className="text-xs text-gray-400">
                Step {tabIdx + 1} of {TABS.length} — {TABS[tabIdx].label}
              </p>
            )}
            <div className="flex gap-2 shrink-0">
              {tabIdx > 0 && (
                <Button variant="outline" onClick={() => setTab(TABS[tabIdx - 1].key)}>
                  ← Back
                </Button>
              )}
              {tabIdx < TABS.length - 1 ? (
                <Button onClick={() => setTab(TABS[tabIdx + 1].key)}>
                  Next →
                </Button>
              ) : (
                <Button disabled={loading} onClick={handleSubmit} className="min-w-[120px]">
                  {loading ? "Saving…" : "Add Staff Member"}
                </Button>
              )}
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </main>
  );
}
