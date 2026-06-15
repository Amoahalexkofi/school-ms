"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export function PostNoticeForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: "ALL",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Title and content are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to post notice");
      router.push("/notice-board");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/notice-board" className="text-sm text-blue-600 hover:underline">
        ← Back to Notice Board
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Post Notice</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={set("title")} placeholder="Notice title" />
          </div>

          <div>
            <Label>Audience</Label>
            <select className={SEL} value={form.audience} onChange={set("audience")}>
              <option value="ALL">Everyone</option>
              <option value="STAFF">Staff only</option>
              <option value="STUDENTS">Students only</option>
              <option value="PARENTS">Parents only</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Label>Content *</Label>
            <textarea
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.content}
              onChange={set("content")}
              placeholder="Write your notice here..."
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Posting…" : "Post Notice"}
            </Button>
            <Link href="/notice-board">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
