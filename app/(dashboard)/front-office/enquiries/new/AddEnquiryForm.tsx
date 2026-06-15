"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddEnquiryForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    classId: "",
    description: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/front-office/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit enquiry");
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
          <CardTitle>Add Enquiry</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Full name" />
          </div>

          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="Phone number" />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={set("email")} placeholder="Email address" />
          </div>

          <div>
            <Label>Note</Label>
            <Input value={form.note} onChange={set("note")} placeholder="Short note" />
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description}
              onChange={set("description")}
              placeholder="Enquiry details..."
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Submitting…" : "Submit Enquiry"}
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
