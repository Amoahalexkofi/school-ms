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
  complaintTypes: any[];
  students: any[];
  staff: any[];
};

export function AddComplaintForm({ complaintTypes, students, staff }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    raisedBy: "",
    phone: "",
    complaintTypeId: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.title.trim() || !form.raisedBy.trim() || !form.description.trim()) {
      alert("Title, raised by, and description are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/front-office/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit complaint");
      router.push("/front-office");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/front-office" className="text-sm text-blue-600 hover:underline">
        ← Back to Front Office
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add Complaint</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={set("title")} placeholder="Brief complaint title" />
          </div>

          <div>
            <Label>Raised By *</Label>
            <Input value={form.raisedBy} onChange={set("raisedBy")} placeholder="Name of complainant" />
          </div>

          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="Contact phone number" />
          </div>

          <div>
            <Label>Complaint Type</Label>
            <select className={SEL} value={form.complaintTypeId} onChange={set("complaintTypeId")}>
              <option value="">— None —</option>
              {complaintTypes.map((ct: any) => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label>Description *</Label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the complaint in detail..."
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Submitting…" : "Submit Complaint"}
            </Button>
            <Link href="/front-office">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
