"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Ban, CheckCircle } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";

export function StudentAvatar({ studentId, image, initials }: { studentId: string; image?: string | null; initials: string }) {
  const router = useRouter();

  async function handleUploaded(url: string) {
    await fetch(`/api/students/${studentId}`, {
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
      color="#2563eb"
    />
  );
}

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const GENDERS = ["Male","Female","Other"];
const RELIGIONS = ["Christian","Muslim","Traditional","Other"];

type Student = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  religion?: string;
  caste?: string;
  nationality?: string;
  mobileNo?: string;
  currentAddress?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  note?: string;
  about?: string;
  isActive: boolean;
  disableReason?: string;
  disableNote?: string;
};

type Props = { student: Student };

export function StudentProfileActions({ student }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen]       = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const [form, setForm] = useState({
    firstName:        student.firstName,
    middleName:       student.middleName ?? "",
    lastName:         student.lastName ?? "",
    dateOfBirth:      student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : "",
    gender:           student.gender ?? "",
    bloodGroup:       student.bloodGroup ?? "",
    religion:         student.religion ?? "",
    caste:            student.caste ?? "",
    nationality:      student.nationality ?? "",
    mobileNo:         student.mobileNo ?? "",
    currentAddress:   student.currentAddress ?? "",
    permanentAddress: student.permanentAddress ?? "",
    city:             student.city ?? "",
    state:            student.state ?? "",
    country:          student.country ?? "",
    pincode:          student.pincode ?? "",
    fatherName:       student.fatherName ?? "",
    fatherPhone:      student.fatherPhone ?? "",
    fatherOccupation: student.fatherOccupation ?? "",
    motherName:       student.motherName ?? "",
    motherPhone:      student.motherPhone ?? "",
    motherOccupation: student.motherOccupation ?? "",
    note:             student.note ?? "",
    about:            student.about ?? "",
  });

  const [disableForm, setDisableForm] = useState({
    disableReason: student.disableReason ?? "",
    disableNote:   student.disableNote ?? "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleEdit() {
    if (!form.firstName || !form.lastName) {
      setError("First name and last name are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update student");
      setEditOpen(false);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDisable() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive:      false,
          disableReason: disableForm.disableReason,
          disableNote:   disableForm.disableNote,
          disabledAt:    new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setDisableOpen(false);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleReEnable() {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, disableReason: null, disableNote: null, disabledAt: null }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } finally { setLoading(false); }
  }

  function Field({ label, name, type = "text", options, textarea }: {
    label: string; name: string; type?: string;
    options?: string[]; textarea?: boolean;
  }) {
    if (options) {
      return (
        <div>
          <Label className="text-xs">{label}</Label>
          <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={(form as any)[name]} onChange={set(name)}>
            <option value="">— Select —</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
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
    <>
      <Button size="sm" variant="outline" onClick={() => { setError(""); setEditOpen(true); }}>
        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
      </Button>
      {student.isActive ? (
        <Button size="sm" variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10"
          onClick={() => { setError(""); setDisableOpen(true); }}>
          <Ban className="h-3.5 w-3.5 mr-1" /> Disable
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
          disabled={loading} onClick={handleReEnable}>
          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Re-enable
        </Button>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={o => !o && setEditOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student — {student.firstName} {student.lastName}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Field label="First Name *" name="firstName" />
            <Field label="Middle Name" name="middleName" />
            <Field label="Last Name *" name="lastName" />
            <Field label="Date of Birth" name="dateOfBirth" type="date" />
            <Field label="Gender" name="gender" options={GENDERS} />
            <Field label="Blood Group" name="bloodGroup" options={BLOOD_GROUPS} />
            <Field label="Religion" name="religion" options={RELIGIONS} />
            <Field label="Caste / Category" name="caste" />
            <Field label="Nationality" name="nationality" />
            <Field label="Mobile No." name="mobileNo" />
            <Field label="Father's Name" name="fatherName" />
            <Field label="Father's Phone" name="fatherPhone" />
            <Field label="Mother's Name" name="motherName" />
            <Field label="Mother's Phone" name="motherPhone" />
            <Field label="Current Address" name="currentAddress" textarea />
            <Field label="City" name="city" />
            <Field label="State / Region" name="state" />
            <Field label="Country" name="country" />
            <Field label="Pincode" name="pincode" />
            <Field label="Note" name="note" textarea />
          </div>
          {error && <p className="text-sm text-red-400 mt-2 bg-red-500/10 px-3 py-2 rounded">{error}</p>}
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
            <DialogTitle>Disable Student</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/40">This student will be marked inactive. You can re-enable them later.</p>
          <div className="space-y-3 mt-3">
            <div>
              <Label className="text-xs">Reason *</Label>
              <Input className="mt-1" value={disableForm.disableReason}
                onChange={e => setDisableForm(f => ({ ...f, disableReason: e.target.value }))}
                placeholder="e.g. Transferred, Withdrawn…" />
            </div>
            <div>
              <Label className="text-xs">Note (optional)</Label>
              <textarea rows={2} className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={disableForm.disableNote}
                onChange={e => setDisableForm(f => ({ ...f, disableNote: e.target.value }))} />
            </div>
          </div>
          {error && <p className="text-sm text-red-400 mt-2 bg-red-500/10 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDisableOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={loading || !disableForm.disableReason}
              onClick={handleDisable}>{loading ? "Saving…" : "Disable Student"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
