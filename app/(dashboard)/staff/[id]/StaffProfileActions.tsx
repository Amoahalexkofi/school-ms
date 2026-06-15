"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Ban, CheckCircle } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";

export function StaffAvatar({ staffId, image, initials }: { staffId: string; image?: string | null; initials: string }) {
  const router = useRouter();

  async function handleUploaded(url: string) {
    await fetch(`/api/staff/${staffId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: url }),
    });
    router.refresh();
  }

  return (
    <AvatarUpload
      currentUrl={image}
      initials={initials}
      onUploaded={handleUploaded}
      size={64}
      color="#4f46e5"
    />
  );
}

const GENDERS   = ["Male", "Female", "Other"];
const MARITAL   = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
const CONTRACTS = ["PERMANENT", "CONTRACT", "TEMPORARY"];
const ROLES     = ["TEACHER", "ADMIN", "ACCOUNTANT", "LIBRARIAN", "SUPER_ADMIN"];

type Props = {
  staff: any;
  departments: any[];
  designations: any[];
};

export function StaffProfileActions({ staff, departments, designations }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen]       = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const [form, setForm] = useState({
    firstName:        staff.firstName,
    lastName:         staff.lastName,
    fatherName:       staff.fatherName ?? "",
    motherName:       staff.motherName ?? "",
    dob:              staff.dob ? new Date(staff.dob).toISOString().slice(0, 10) : "",
    gender:           staff.gender ?? "",
    maritalStatus:    staff.maritalStatus ?? "",
    religion:         staff.religion ?? "",
    qualification:    staff.qualification ?? "",
    workExperience:   staff.workExperience ?? "",
    role:             staff.user?.role ?? "TEACHER",
    departmentId:     staff.departmentId ?? "",
    designationId:    staff.designationId ?? "",
    dateOfJoining:    staff.dateOfJoining ? new Date(staff.dateOfJoining).toISOString().slice(0, 10) : "",
    contractType:     staff.contractType ?? "",
    payscale:         staff.payscale ?? "",
    shift:            staff.shift ?? "",
    location:         staff.location ?? "",
    contactNo:        staff.contactNo ?? "",
    emergencyContact: staff.emergencyContact ?? "",
    localAddress:     staff.localAddress ?? "",
    permanentAddress: staff.permanentAddress ?? "",
    city:             staff.city ?? "",
    state:            staff.state ?? "",
    country:          staff.country ?? "",
    basicSalary:      staff.basicSalary ? String(staff.basicSalary) : "",
    bankAccountNo:    staff.bankAccountNo ?? "",
    bankName:         staff.bankName ?? "",
    ifscCode:         staff.ifscCode ?? "",
    bankBranch:       staff.bankBranch ?? "",
    epfNo:            staff.epfNo ?? "",
    facebook:         staff.facebook ?? "",
    twitter:          staff.twitter ?? "",
    linkedin:         staff.linkedin ?? "",
    instagram:        staff.instagram ?? "",
    note:             staff.note ?? "",
  });

  const [disableNote, setDisableNote] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleEdit() {
    if (!form.firstName || !form.lastName) {
      setError("First name and last name are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setEditOpen(false);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDisable() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false, disabledAt: new Date().toISOString(), note: disableNote || staff.note }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setDisableOpen(false);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleReEnable() {
    setLoading(true);
    try {
      await fetch(`/api/staff/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, disabledAt: null }),
      });
      router.refresh();
    } finally { setLoading(false); }
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

  const deptOptions  = departments.map((d: any)  => ({ value: d.id, label: d.name }));
  const desigOptions = designations.map((d: any) => ({ value: d.id, label: d.name }));

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => { setError(""); setEditOpen(true); }}>
        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
      </Button>
      {staff.isActive ? (
        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => { setError(""); setDisableOpen(true); }}>
          <Ban className="h-3.5 w-3.5 mr-1" /> Disable
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
          disabled={loading} onClick={handleReEnable}>
          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Re-enable
        </Button>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={o => !o && setEditOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff — {staff.firstName} {staff.lastName}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Field label="First Name *" name="firstName" />
            <Field label="Last Name *"  name="lastName" />
            <Field label="Father's Name" name="fatherName" />
            <Field label="Mother's Name" name="motherName" />
            <Field label="Date of Birth" name="dob" type="date" />
            <Field label="Gender" name="gender" options={GENDERS} />
            <Field label="Marital Status" name="maritalStatus" options={MARITAL} />
            <Field label="Religion" name="religion" />
            <Field label="Qualification" name="qualification" />
            <Field label="Work Experience" name="workExperience" />
            <Field label="Role" name="role" options={ROLES} />
            <Field label="Department" name="departmentId" options={deptOptions} />
            <Field label="Designation" name="designationId" options={desigOptions} />
            <Field label="Date of Joining" name="dateOfJoining" type="date" />
            <Field label="Contract Type" name="contractType" options={CONTRACTS} />
            <Field label="Payscale" name="payscale" />
            <Field label="Shift" name="shift" />
            <Field label="Location" name="location" />
            <Field label="Contact No." name="contactNo" />
            <Field label="Emergency Contact" name="emergencyContact" />
            <Field label="Local Address" name="localAddress" textarea />
            <Field label="City" name="city" />
            <Field label="State" name="state" />
            <Field label="Country" name="country" />
            <Field label="Basic Salary" name="basicSalary" type="number" />
            <Field label="Bank Name" name="bankName" />
            <Field label="Account No." name="bankAccountNo" />
            <Field label="IFSC / Sort Code" name="ifscCode" />
            <Field label="Facebook" name="facebook" />
            <Field label="LinkedIn" name="linkedin" />
            <Field label="Note" name="note" textarea />
          </div>
          {error && <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={handleEdit}>{loading ? "Saving…" : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={disableOpen} onOpenChange={o => !o && setDisableOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Staff Member</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This staff member will be marked inactive. You can re-enable them later.</p>
          <div className="mt-3">
            <Label className="text-xs">Note (optional)</Label>
            <textarea rows={2} className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={disableNote} onChange={e => setDisableNote(e.target.value)}
              placeholder="e.g. Resigned, Contract ended…" />
          </div>
          {error && <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDisableOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={loading} onClick={handleDisable}>
              {loading ? "Saving…" : "Disable Staff"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
