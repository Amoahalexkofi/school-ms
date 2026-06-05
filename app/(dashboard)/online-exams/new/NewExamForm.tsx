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

type Props = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
};

export function NewExamForm({ classes, subjects }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    classId: "",
    subjectId: "",
    duration: "60",
    passingPercentage: "50",
    startTime: "",
    endTime: "",
    instructions: "",
  });

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError("Exam title is required"); return; }
    if (!form.startTime) { setError("Start time is required"); return; }
    if (!form.endTime) { setError("End time is required"); return; }

    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        classId: form.classId || null,
        subjectId: form.subjectId || null,
        duration: parseInt(form.duration) || 60,
        passingPercentage: form.passingPercentage ? parseFloat(form.passingPercentage) : null,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        instructions: form.instructions || null,
      };

      const res = await fetch("/api/online-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create exam");
      router.push("/online-exams");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/online-exams"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Online Exams
        </Link>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exam Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Exam Title *</Label>
                <Input
                  placeholder="e.g. Mid-term Math Quiz"
                  value={form.title}
                  onChange={set("title")}
                />
              </div>

              <div>
                <Label className="text-xs mb-1 block">Class (optional)</Label>
                <select className={SEL} value={form.classId} onChange={set("classId")}>
                  <option value="">Any class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Subject (optional)</Label>
                <select className={SEL} value={form.subjectId} onChange={set("subjectId")}>
                  <option value="">Any subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Duration (minutes) *</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={set("duration")}
                  min={1}
                  placeholder="60"
                />
              </div>

              <div>
                <Label className="text-xs mb-1 block">Passing Percentage (optional)</Label>
                <Input
                  type="number"
                  value={form.passingPercentage}
                  onChange={set("passingPercentage")}
                  min={0}
                  max={100}
                  placeholder="50"
                />
              </div>

              <div>
                <Label className="text-xs mb-1 block">Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={set("startTime")}
                />
              </div>

              <div>
                <Label className="text-xs mb-1 block">End Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={set("endTime")}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Instructions (optional)</Label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Instructions for students taking this exam…"
                  value={form.instructions}
                  onChange={set("instructions")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Link href="/online-exams">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="button" disabled={saving} onClick={handleSubmit}>
            {saving ? "Creating…" : "Create Exam"}
          </Button>
        </div>
      </div>
    </main>
  );
}
