"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const EXAM_TYPES = ["TERM", "MIDTERM", "FINAL", "UNIT_TEST", "MOCK", "OTHER"];

export function NewExamGroupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    examType: "",
    description: "",
    passingPercentage: "33",
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
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create exam group");
      router.push("/exams");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/exams" className="text-sm text-blue-600 hover:underline">
        ← Back to Examinations
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>New Exam Group</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Term 1 Exams 2026" />
          </div>

          <div>
            <Label>Exam Type</Label>
            <select className={SEL} value={form.examType} onChange={set("examType")}>
              <option value="">— Select —</option>
              {EXAM_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Passing Percentage (%)</Label>
            <Input type="number" min="0" max="100" value={form.passingPercentage} onChange={set("passingPercentage")} placeholder="33" />
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description}
              onChange={set("description")}
              placeholder="Optional description..."
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Creating…" : "Create Exam Group"}
            </Button>
            <Link href="/exams">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
