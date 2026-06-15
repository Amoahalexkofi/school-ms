"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

type Props = {
  books: any[];
  students: any[];
  staff: any[];
};

export function IssueBookForm({ books, students, staff }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bookId: "",
    issueTo: "student",
    studentId: "",
    staffId: "",
    dueDate: "",
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  const today = new Date().toISOString().slice(0, 10);
  const availableBooks = books.filter(b => b.available > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const studentId = form.issueTo === "student" ? form.studentId : undefined;
    const staffId   = form.issueTo === "staff"   ? form.staffId   : undefined;
    if (!form.bookId) { alert("Please select a book"); return; }
    if (!form.dueDate) { alert("Due date is required"); return; }
    if (!studentId && !staffId) { alert("Please select a borrower"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/library/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: form.bookId, studentId, staffId, dueDate: form.dueDate }),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to issue book"); return; }
      router.push("/library");
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <Link href="/library" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Issue Book</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Book *</Label>
              <select className={SEL} value={form.bookId} onChange={e => set("bookId", e.target.value)}>
                <option value="">— Select Book —</option>
                {availableBooks.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.title} (available: {b.available})</option>
                ))}
              </select>
              {availableBooks.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No books available for issue right now.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Borrower Type</Label>
              <div className="flex gap-2 mt-1">
                {["student", "staff"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("issueTo", t)}
                    className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                      form.issueTo === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {form.issueTo === "student" ? (
              <div className="md:col-span-2">
                <Label>Student *</Label>
                <select className={SEL} value={form.studentId} onChange={e => set("studentId", e.target.value)}>
                  <option value="">— Select Student —</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="md:col-span-2">
                <Label>Staff Member *</Label>
                <select className={SEL} value={form.staffId} onChange={e => set("staffId", e.target.value)}>
                  <option value="">— Select Staff —</option>
                  {staff.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.employeeId})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label>Due Date *</Label>
              <input
                type="date"
                min={today}
                className={SEL}
                value={form.dueDate}
                onChange={e => set("dueDate", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Issue Book"}</Button>
        </div>
      </form>
    </main>
  );
}
