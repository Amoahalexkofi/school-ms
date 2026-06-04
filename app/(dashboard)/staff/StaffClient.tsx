"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCog, Plus, Search, Eye } from "lucide-react";

type Props = { staff: any[]; departments: any[]; designations: any[] };

const TABS = ["Personal", "Employment", "Contact", "Financial", "Social"] as const;
type Tab = typeof TABS[number];

const GENDERS      = ["Male", "Female", "Other"];
const RELIGIONS    = ["Christian", "Muslim", "Traditional", "Other"];
const MARITAL      = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
const CONTRACTS    = ["PERMANENT", "CONTRACT", "TEMPORARY"];
const ROLES        = ["TEACHER", "ADMIN", "ACCOUNTANT", "LIBRARIAN", "SUPER_ADMIN"];

const ROLE_STYLE: Record<string, string> = {
  TEACHER:     "bg-green-100 text-green-700",
  ADMIN:       "bg-blue-100 text-blue-700",
  ACCOUNTANT:  "bg-yellow-100 text-yellow-700",
  LIBRARIAN:   "bg-pink-100 text-pink-700",
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
};

export function StaffClient({ staff, departments, designations }: Props) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<Tab>("Personal");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [filterDept, setFilterDept] = useState("");

  const [form, setForm] = useState({
    // Personal
    firstName: "", lastName: "", fatherName: "", motherName: "",
    dob: "", gender: "", maritalStatus: "", religion: "", qualification: "", workExperience: "",
    // Employment
    employeeId: "", role: "TEACHER", departmentId: "", designationId: "",
    dateOfJoining: "", contractType: "", payscale: "", shift: "", location: "",
    // Contact
    email: "", contactNo: "", emergencyContact: "",
    localAddress: "", permanentAddress: "", city: "", state: "", country: "",
    // Financial
    basicSalary: "", bankAccountNo: "", bankName: "", ifscCode: "", bankBranch: "", epfNo: "",
    // Social
    facebook: "", twitter: "", linkedin: "", instagram: "", note: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || (
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.employeeId?.toLowerCase().includes(q) ||
      s.contactNo?.includes(q)
    );
    const matchDept = !filterDept || s.departmentId === filterDept;
    return matchSearch && matchDept;
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

  function resetAndOpen() {
    setForm({
      firstName: "", lastName: "", fatherName: "", motherName: "",
      dob: "", gender: "", maritalStatus: "", religion: "", qualification: "", workExperience: "",
      employeeId: "", role: "TEACHER", departmentId: "", designationId: "",
      dateOfJoining: "", contractType: "", payscale: "", shift: "", location: "",
      email: "", contactNo: "", emergencyContact: "",
      localAddress: "", permanentAddress: "", city: "", state: "", country: "",
      basicSalary: "", bankAccountNo: "", bankName: "", ifscCode: "", bankBranch: "", epfNo: "",
      facebook: "", twitter: "", linkedin: "", instagram: "", note: "",
    });
    setError(""); setTab("Personal"); setOpen(true);
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
              ? <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
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

  const deptOptions = departments.map((d: any) => ({ value: d.id, label: d.name }));
  const desigOptions = designations.map((d: any) => ({ value: d.id, label: d.name }));

  return (
    <main className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9 w-64" placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <Button onClick={resetAndOpen}>
          <Plus className="h-4 w-4 mr-1" /> Add Staff
        </Button>
      </div>

      {/* Table */}
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
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Employee ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3" />
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

      {/* Add Staff Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
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
            {/* ── Personal ── */}
            {tab === "Personal" && <>
              <Field label="First Name *" name="firstName" />
              <Field label="Last Name *" name="lastName" />
              <Field label="Father's Name" name="fatherName" />
              <Field label="Mother's Name" name="motherName" />
              <Field label="Date of Birth" name="dob" type="date" />
              <Field label="Gender *" name="gender" options={GENDERS} />
              <Field label="Marital Status" name="maritalStatus" options={MARITAL} />
              <Field label="Religion" name="religion" options={RELIGIONS} />
              <Field label="Qualification" name="qualification" />
              <Field label="Work Experience" name="workExperience" />
            </>}

            {/* ── Employment ── */}
            {tab === "Employment" && <>
              <Field label="Employee ID (auto if blank)" name="employeeId" />
              <Field label="Role" name="role" options={ROLES} />
              <Field label="Department" name="departmentId" options={deptOptions} />
              <Field label="Designation" name="designationId" options={desigOptions} />
              <Field label="Date of Joining" name="dateOfJoining" type="date" />
              <Field label="Contract Type" name="contractType" options={CONTRACTS} />
              <Field label="Payscale" name="payscale" />
              <Field label="Shift" name="shift" />
              <Field label="Location" name="location" />
            </>}

            {/* ── Contact ── */}
            {tab === "Contact" && <>
              <Field label="Email" name="email" type="email" />
              <Field label="Contact No." name="contactNo" />
              <Field label="Emergency Contact" name="emergencyContact" />
              <Field label="Local Address" name="localAddress" textarea />
              <Field label="Permanent Address" name="permanentAddress" textarea />
              <Field label="City" name="city" />
              <Field label="State / Region" name="state" />
              <Field label="Country" name="country" />
            </>}

            {/* ── Financial ── */}
            {tab === "Financial" && <>
              <Field label="Basic Salary" name="basicSalary" type="number" />
              <Field label="Bank Account No." name="bankAccountNo" />
              <Field label="Bank Name" name="bankName" />
              <Field label="IFSC / Sort Code" name="ifscCode" />
              <Field label="Bank Branch" name="bankBranch" />
              <Field label="EPF / Pension No." name="epfNo" />
            </>}

            {/* ── Social ── */}
            {tab === "Social" && <>
              <Field label="Facebook" name="facebook" />
              <Field label="Twitter / X" name="twitter" />
              <Field label="LinkedIn" name="linkedin" />
              <Field label="Instagram" name="instagram" />
              <Field label="Note" name="note" textarea />
            </>}
          </div>

          {error && <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-2 rounded">{error}</p>}

          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              {tab !== "Personal" && (
                <Button variant="outline" onClick={() => setTab(TABS[TABS.indexOf(tab) - 1])}>← Back</Button>
              )}
              {tab !== "Social" && (
                <Button variant="outline" onClick={() => setTab(TABS[TABS.indexOf(tab) + 1])}>Next →</Button>
              )}
            </div>
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Saving…" : "Add Staff"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
