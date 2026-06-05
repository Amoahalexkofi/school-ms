"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

type Props = {
  leaveTypes: any[];
  staff: any[];
  students: any[];
};

export function AddLeaveForm({ leaveTypes, staff, students }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"staff" | "student">("staff");
  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
    staffId: "",
    studentId: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.leaveTypeId || !form.fromDate || !form.toDate) {
      alert("Leave type, from date, and to date are required");
      return;
    }
    if (type === "staff" && !form.staffId) {
      alert("Please select a staff member");
      return;
    }
    if (type === "student" && !form.studentId) {
      alert("Please select a student");
      return;
    }

    setLoading(true);
    try {
      const url = type === "staff" ? "/api/leave/staff" : "/api/leave/students";
      const body =
        type === "staff"
          ? { staffId: form.staffId, leaveTypeId: form.leaveTypeId, fromDate: form.fromDate, toDate: form.toDate, reason: form.reason }
          : { studentId: form.studentId, leaveTypeId: form.leaveTypeId, fromDate: form.fromDate, toDate: form.toDate, reason: form.reason };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit request");
      router.push("/leave");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/leave" className="text-sm text-blue-600 hover:underline">
        ← Back to Leave Management
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Apply for Leave</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Applicant type selector */}
          <div>
            <Label className="mb-2 block">Leave For *</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("staff")}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  type === "staff"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Staff Leave
              </button>
              <button
                type="button"
                onClick={() => setType("student")}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  type === "student"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Student Leave
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Applicant selector */}
            {type === "staff" ? (
              <div>
                <Label>Staff Member *</Label>
                <select className={SEL} value={form.staffId} onChange={set("staffId")}>
                  <option value="">— Select Staff —</option>
                  {staff.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <Label>Student *</Label>
                <select className={SEL} value={form.studentId} onChange={set("studentId")}>
                  <option value="">— Select Student —</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Leave type */}
            <div>
              <Label>Leave Type *</Label>
              <select className={SEL} value={form.leaveTypeId} onChange={set("leaveTypeId")}>
                <option value="">— Select Type —</option>
                {leaveTypes.map((lt: any) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.daysAllowed} days/yr)
                  </option>
                ))}
              </select>
            </div>

            {/* From date */}
            <div>
              <Label>From Date *</Label>
              <Input type="date" value={form.fromDate} onChange={set("fromDate")} />
            </div>

            {/* To date */}
            <div>
              <Label>To Date *</Label>
              <Input type="date" value={form.toDate} onChange={set("toDate")} />
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <Label>Reason</Label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.reason}
                onChange={set("reason")}
                placeholder="Optional reason for leave..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Submitting…" : "Submit Request"}
            </Button>
            <Link href="/leave">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
