"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddBookForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    bookNo: "",
    isbn: "",
    subject: "",
    rackNo: "",
    author: "",
    publisher: "",
    quantity: "1",
    perUnitCost: "",
    description: "",
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { alert("Title is required"); return; }
    if (!form.author.trim()) { alert("Author is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/library/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to save book"); return; }
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
          <CardHeader><CardTitle>Book Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div>
              <Label>Author *</Label>
              <Input value={form.author} onChange={e => set("author", e.target.value)} required />
            </div>
            <div>
              <Label>Book No.</Label>
              <Input value={form.bookNo} onChange={e => set("bookNo", e.target.value)} />
            </div>
            <div>
              <Label>ISBN</Label>
              <Input value={form.isbn} onChange={e => set("isbn", e.target.value)} />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={e => set("subject", e.target.value)} />
            </div>
            <div>
              <Label>Rack No.</Label>
              <Input value={form.rackNo} onChange={e => set("rackNo", e.target.value)} />
            </div>
            <div>
              <Label>Publisher</Label>
              <Input value={form.publisher} onChange={e => set("publisher", e.target.value)} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
            </div>
            <div>
              <Label>Cost per Unit (₵)</Label>
              <Input type="number" min="0" step="0.01" value={form.perUnitCost} onChange={e => set("perUnitCost", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </main>
  );
}
