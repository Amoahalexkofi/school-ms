"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, AlertCircle, Plus } from "lucide-react";

async function post(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
  return res.json();
}

export function LibraryClient({ books, issues, students, staff }: any) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", quantity: "1" });
  const [issueForm, setIssueForm] = useState({ bookId: "", dueDate: "", studentId: "", staffId: "" });

  const totalBooks = books.reduce((s: number, b: any) => s + b.quantity, 0);
  const totalAvailable = books.reduce((s: number, b: any) => s + b.available, 0);
  const overdueCount = issues.filter((i: any) => new Date(i.dueDate) < new Date()).length;

  async function submit(url: string, body: object) {
    setLoading(true); setError("");
    try { await post(url, body); setOpen(null); router.refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function returnBook(issueId: string) {
    setLoading(true);
    try { await post(`/api/library/issues/${issueId}/return`, {}); router.refresh(); }
    catch (e: any) { alert((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex-1 p-6 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Titles</p><p className="text-3xl font-bold">{books.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Copies</p><p className="text-3xl font-bold">{totalBooks}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Available</p><p className="text-3xl font-bold text-green-600">{totalAvailable}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Overdue</p><p className={`text-3xl font-bold ${overdueCount > 0 ? "text-red-600" : "text-gray-800"}`}>{overdueCount}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-600" /> Book Catalog</CardTitle>
          <Button size="sm" onClick={() => { setError(""); setOpen("book"); }}><Plus className="h-4 w-4 mr-1" /> Add Book</Button>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No books yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Title</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Author</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Qty</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Available</th>
                  <th className="px-3 py-2"></th>
                </tr></thead>
                <tbody className="divide-y">
                  {books.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium">{b.title}</td>
                      <td className="px-3 py-2.5 text-gray-600">{b.author}</td>
                      <td className="px-3 py-2.5 text-gray-500">{b.category ?? "—"}</td>
                      <td className="px-3 py-2.5 text-right">{b.quantity}</td>
                      <td className="px-3 py-2.5 text-right"><span className={`font-semibold ${b.available === 0 ? "text-red-600" : "text-green-600"}`}>{b.available}</span></td>
                      <td className="px-3 py-2.5">
                        {b.available > 0 && (
                          <Button size="sm" variant="outline" onClick={() => { setError(""); setIssueForm(f => ({ ...f, bookId: b.id })); setOpen("issue"); }}>Issue</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4 text-orange-500" /> Active Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? <p className="text-sm text-gray-500 text-center py-6">No active issues.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Book</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Issued To</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Due</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                  <th className="px-3 py-2"></th>
                </tr></thead>
                <tbody className="divide-y">
                  {issues.map((i: any) => {
                    const isOverdue = new Date(i.dueDate) < new Date();
                    const name = i.student ? `${i.student.firstName} ${i.student.lastName}` : i.staff ? `${i.staff.firstName} ${i.staff.lastName}` : "—";
                    return (
                      <tr key={i.id} className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50" : ""}`}>
                        <td className="px-3 py-2.5 font-medium">{i.book.title}</td>
                        <td className="px-3 py-2.5">{name}</td>
                        <td className={`px-3 py-2.5 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}`}>{new Date(i.dueDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{isOverdue ? "OVERDUE" : "ISSUED"}</span></td>
                        <td className="px-3 py-2.5"><Button size="sm" variant="outline" disabled={loading} onClick={() => returnBook(i.id)}>Return</Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Book Dialog */}
      <Dialog open={open === "book"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input className="mt-1" value={bookForm.title} onChange={e => setBookForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Author *</Label><Input className="mt-1" value={bookForm.author} onChange={e => setBookForm(f => ({ ...f, author: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ISBN</Label><Input className="mt-1" value={bookForm.isbn} onChange={e => setBookForm(f => ({ ...f, isbn: e.target.value }))} /></div>
              <div><Label>Category</Label><Input className="mt-1" value={bookForm.category} onChange={e => setBookForm(f => ({ ...f, category: e.target.value }))} /></div>
            </div>
            <div><Label>Quantity</Label><Input className="mt-1" type="number" min="1" value={bookForm.quantity} onChange={e => setBookForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/library/books", { ...bookForm, quantity: Number(bookForm.quantity) })}>
              {loading ? "Adding…" : "Add Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={open === "issue"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Book *</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={issueForm.bookId} onChange={e => setIssueForm(f => ({ ...f, bookId: e.target.value }))}>
                <option value="">Select book</option>
                {books.filter((b: any) => b.available > 0).map((b: any) => <option key={b.id} value={b.id}>{b.title} ({b.available} available)</option>)}
              </select>
            </div>
            <div>
              <Label>Issue To — Student</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={issueForm.studentId} onChange={e => setIssueForm(f => ({ ...f, studentId: e.target.value, staffId: "" }))}>
                <option value="">— Select student —</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
              </select>
            </div>
            <div>
              <Label>Or Staff</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={issueForm.staffId} onChange={e => setIssueForm(f => ({ ...f, staffId: e.target.value, studentId: "" }))}>
                <option value="">— Select staff —</option>
                {staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            <div><Label>Due Date *</Label><Input className="mt-1" type="date" value={issueForm.dueDate} onChange={e => setIssueForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/library/issues", { ...issueForm, studentId: issueForm.studentId || undefined, staffId: issueForm.staffId || undefined })}>
              {loading ? "Issuing…" : "Issue Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
